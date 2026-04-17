// game-logic.js
// Justin Smith, 2025

//
// Global Variables ('let' can be reassigned later; 'const' cannot)
//

const CURRENT_VERSION = "1.23";
const GAME_TITLE = "Voozo";
// The address to the game, so we can post it in the Share dialog
const URL = "https://admiralspunky.github.io/venn/";

const MESSAGE_DISPLAY_TIME = 5000;
const MIN_RULE_MATCHING_WORDS_PER_CATEGORY = 1;

//I'm transitioning to having separate game modes, but now each mode needs to have its own, slightly different, tutorial text
function getTutorialText(mode) {
    const baseRules = "Voozo is a logic puzzle where you sort words into zones based on hidden spelling rules. Place each word from your hand into the correct zone. If you're wrong, the card moves to the correct spot.";
    
    const goals = {
        classic: "Your goal is to **empty your hand** of cards. If you place a card in the wrong zone, you must draw a replacement.",
        turnLimit: "Your goal is to **place as many words as possible** within the turn limit.",
        timeAttack: "Your goal is to **clear your hand as fast as possible** before the clock runs out."
    };

    const closing = "Check the settings for a list of all possible rules. Try the different game modes. Come back tomorrow for a new set of words and rules.";
    
    return `${baseRules}\n\n${goals[mode]}\n\n${closing}`;
	//return `There are three hidden spelling rules for you to deduce, by sorting words into the correct zones.  The rules are hidden, but there's a button in the Settings menu that will display all of the possible rules for your benefit. If you play a card in the wrong zone, you have to draw a card to replace it. You're trying to empty your hand of cards. https://www.youtube.com/watch?v=xQWNT3gHjAw`;
	
}

const ABOUT_TEXT = "I want to thank Ken Wickle for inspiring me to write this game."
const BYLINE = "© 2025 Justin Smith. All Rights Reserved admiralspunky@gmail.com"
const major = 6012031;

//these variables belong to the current game, as opposed to settings which cover many games
const session = {
	// Basic Stats
	turns: 0, // how many times has the player submitted a word?
	livesRemaining: 0,	// when the player makes an incorrect guess, he loses a life
	dailyMode: false, // is this the player's first game today?
	
	// Board State
    wordsInPlay: [], //these words are somewhere on the board, think of it as a no-duplicate list
	currentWordPool: [], //these words are still in the deck
	currentHand: [], //these words are currently in your hand (duh)
	activeRules: [], 
	
	// Reporting
    previousResults: "", //we're keeping track of the results of the previous guesses, so we can build a pretty Share dialog
	
	// Timer
	timerID: null,
    startTime: null,
    formattedTime: "0:00", //updateTimer sets this string to `${minutes}:${seconds.toString().padStart(2, '0')}`;
	
	// Zones (areas where you can play a card)
	zoneWeights: [],// If a word gets placed in a zone, make that zone likely to be chosen again, when we're drawing cards for the hand
	zoneKeys: [], //this is the list of zones (or just their names, I'm not certain)
};


let selectedWordId = null; // Used for click-to-place, will also be used for drag-and-drop
let isDarkMode = localStorage.getItem('theme') === 'dark';

// User's selected lives, retrieved from localStorage or defaulting to 3
let userSetLives = parseInt(localStorage.getItem('userSetLives') || '3', 10);
// the user can also set how many rules (Venn circles) he wants:
let numRules = parseInt(localStorage.getItem('numRules') || '3', 10);
// the user can also set how many cards he wants in his hand:
let INITIAL_HAND_SIZE = parseInt(localStorage.getItem('numCards') || '5', 10);

// Daily streak variables
let dailyStreak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);
let lastDailyCompletionDate = localStorage.getItem('lastDailyCompletionDate') || '';

const settingsModalOverlay = document.getElementById('settings-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const darkModeToggleBtn = document.getElementById('dark-mode-toggle-btn');
const hintBtn = document.getElementById('hintBtn');
const showAllRulesBtn = document.getElementById('showAllRulesBtn');
const concedeButton = document.getElementById('concedeButton');
const rulesPopupOverlay = document.getElementById('rules-popup-overlay');
const rulesPopupContent = document.getElementById('rules-popup-content');

const aboutBtn = document.getElementById('about-btn');

// Get the difficulty sliders and display elements inside the modal
const difficultySlider = document.getElementById('difficulty-slider');
const livesDisplayModal = document.getElementById('lives-display-modal');

const rulesSlider = document.getElementById('numRules-slider');
const rulesDisplay = document.getElementById('numRules-modal');

const cardsSliderSetting = document.getElementById('numCards-slider');
const cardsDisplaySetting = document.getElementById('numCards-modal');


const livesDisplay = document.getElementById('lives-display');
const timerDisplay = document.getElementById('timer-display');
const settingsBtn = document.getElementById('settings-btn');
const messageBox = document.getElementById('message-box');
const handContainer = document.getElementById('hand-container');

// A function to get all of the zone elements from the DOM dynamically
// I am currently just keeping track of the game elements by where they are on the screen, which is fragile
function getZoneElements() {
    const zones = {};
    const zoneElements = document.querySelectorAll('#rules-grid-container .rule-box');
    zoneElements.forEach(element => {
        const key = element.dataset.zoneKey;
        if (key) {
            zones[key] = {
                container: element,
                wordsDiv: element.querySelector('.word-cards-container')
            };
        }
    });
    // Add the hand container separately
    zones['hand'] = {
        container: document.getElementById('hand-container'),
        wordsDiv: document.getElementById('hand-container').querySelector('.word-cards-container')
    };
    return zones;
}

// A function to generate the zone configurations dynamically
// This function is the "Venn Diagram Generator." Its job is to calculate every possible combination of your rules so the game can create "Intersection Zones." If you have 3 rules, this function doesn't just create 3 zones; it creates $2^n$ zones (in this case, 8) to account for cards that might satisfy Rule 1, Rule 2, and Rule 3 simultaneously.
function getZoneConfigs(numRules) {
    const configs = {};
    
    // This part generates all possible combinations of rules and creates the config for each
    for (let i = 0; i < Math.pow(2, numRules); i++) {
        const ruleIndices = [];
        let zoneKey = '';
        let customLabel = '';

        for (let j = 0; j < numRules; j++) {
            if ((i >> j) & 1) //bit arithmetic
			{
                ruleIndices.push(j + 1);
            }
        }
        
        if (ruleIndices.length > 0) {
            zoneKey = ruleIndices.join('-');
            customLabel = ruleIndices.join(' & ');
        } else {
            zoneKey = '0'; // The 'None' zone
            customLabel = 'None of the above';
        }

        configs[zoneKey] = {
            id: `zone-${zoneKey.replace(/-/g, '')}`, // Create the ID based on the key
            colorVar: `--zone${zoneKey.replace(/-/g, '')}-bg`,
            customLabel: customLabel,
            ruleIndices: ruleIndices.map(r => r - 1), // Adjust back to 0-based
        };
    }
    return configs;
}

// Call these functions to get your dynamic objects
const zoneElements = getZoneElements(); //This object is a map of your HTML elements. Its job is to provide a quick reference to the physical parts of your game board.
const zoneConfigs = getZoneConfigs(numRules); // This object holds all the logical data about each zone. It tells the game how a zone works.
//console.log("at the start of the game, ", zoneConfigs);

document.title = GAME_TITLE;

// Dynamically generate zone weights based on the number of rules
session.zoneWeights = {};
session.zoneKeys = Object.keys(zoneConfigs);



 
console.log("Venn Diagram Game script loaded." + CURRENT_VERSION);

document.addEventListener("DOMContentLoaded", () => {
	console.log("DOMContentLoaded");
	
    // Safe DOM setup
	const urlEl = document.getElementById('url-display');
    if (urlEl) urlEl.textContent = URL; 
    const versionEl = document.getElementById('version-display');
	if (versionEl) versionEl.textContent = 'v' + CURRENT_VERSION; 

/* I'm currently using the game's logo instead of a text title, and I'm setting img src="logo.png" in the HTML, so I probably don't need this code here anymore
    const titleEl = document.getElementById('game-title-text');
	if (titleEl) titleEl.textContent = GAME_TITLE; 
*/
    
    // Safe theme setup, do we want to start in dark or light mode?
    applyTheme();

    // Initialize difficulty slider and display
    if (difficultySlider && livesDisplayModal) {
        userSetLives = parseInt(localStorage.getItem('userSetLives') || '3', 10);
        difficultySlider.value = userSetLives;
        livesDisplayModal.textContent = userSetLives;

        difficultySlider.addEventListener('input', (event) => {
			console.log("Lives slider moved.");
            updateLivesSetting(parseInt(event.target.value, 10));
        });
    }
	
	// Initialize rules slider and display
    if (rulesSlider && rulesDisplay) {
		console.log("rules slider initialized.");
        
        rulesSlider.value = numRules;
        rulesDisplay.textContent = numRules;

        rulesSlider.addEventListener('input', (event) => {
			console.log("rules slider moved.");
			rulesDisplay.textContent = rulesSlider.value;
			localStorage.setItem('numRules',rulesSlider.value);
        });
    }

	// Initialize hand cards slider and display
    if (cardsSliderSetting && cardsDisplaySetting) {
		
		console.log("hand card slider initialized.");
        
        cardsSliderSetting.value = INITIAL_HAND_SIZE;
        cardsDisplaySetting.textContent = INITIAL_HAND_SIZE;

        cardsSliderSetting.addEventListener('input', (event) => {
			console.log("card slider moved.");
			cardsDisplaySetting.textContent = cardsSliderSetting.value;
			localStorage.setItem('numCards',cardsSliderSetting.value);
        });
    }

    // Existing DOMContentLoaded logic for starting game
    const today = getTodayDateString();
    const lastPlayed = localStorage.getItem("lastDailyDate");

    // Check for missed daily puzzle and reset streak if necessary
    if (lastPlayed && lastPlayed !== today) {
        const lastDate = new Date(lastPlayed);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate - lastDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 1) { // If more than one day has passed since last play
            dailyStreak = 0;
            localStorage.setItem('dailyStreak', dailyStreak);
            console.log("Missed a day. Daily streak reset to 0.");
        }
    }
	
	document.getElementById('settings-tutorial-text').textContent = getTutorialText('classic');
	document.getElementById('about-text').textContent = ABOUT_TEXT;
	
	// Tutorial Modal Logic (only on the first time you play)
	const tutorialModalOverlay = document.getElementById('tutorial-modal-overlay');
	const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
	const tutorialOkBtn = document.getElementById('tutorial-ok-btn');
	const tutorialTextElement = document.getElementById('tutorial-text');
	const bylineDisplayElement = document.getElementById('byline-display'); // Get the BYLINE element

	if (tutorialTextElement && typeof getTutorialText === 'function') {
		tutorialTextElement.textContent = getTutorialText('classic');
	}

	if (bylineDisplayElement && typeof BYLINE !== 'undefined') {
		bylineDisplayElement.textContent = BYLINE;
	}


	if (!localStorage.getItem('hasSeenTutorial')) {
		setTimeout(() => {
			tutorialModalOverlay.classList.add('visible');
		}, 500);
	}

	function hideTutorial() {
		tutorialModalOverlay.classList.remove('visible');
		localStorage.setItem('hasSeenTutorial', 'true');
	}

	tutorialCloseBtn?.addEventListener('click', hideTutorial);
	tutorialOkBtn?.addEventListener('click', hideTutorial);
    
	//start game here
	if (lastPlayed !== today) {
        localStorage.setItem("lastDailyDate", today);
        console.log("Starting Daily Game for", today);
        startGame(true);
    } else {
        console.log("Starting regular game");
        startGame(false);
    }
}); 
 
 
/**
 * Asynchronously initializes and starts a new game session, supporting both
 * standard and daily challenge modes.
 *
 * This function is typically invoked by a user interface event, such as clicking
 * a "Start Game" or "Play Daily" button. It orchestrates the entire game setup
 * process, ensuring a consistent and reproducible game state, especially in daily mode.
 *
 * @param {boolean} isDaily - True if starting a daily challenge, false for a regular game.
 * In daily mode, game generation is deterministic based on the day's seed.
 *
 * The function performs the following steps:
 * 1.  Sets the `dailyMode` flag based on the `isDaily` parameter.
 * 2.  Determines a **deterministic seed** for game generation:
 * - For daily mode, it uses `getDailySeed()`.
 * - For regular mode, it generates a random seed.
 * 3.  Generates `activeRules` for the current game using the main seed, potentially
 * creating overlaps based on `allPossibleRules`.
 * 4.  Updates the game's visual title and daily badge according to `isDaily`.
 * 5.  Resets all global game state variables to their initial values via `resetGameState()`.
 * 6.  Generates the `initialFullWordPool` using a **seeded random number generator**
 * (main seed + 1) to ensure the full list of available words is deterministic.
 * 7.  **Seeds initial words into specific zones** on the game board using `seedInitialZones()`,
 * drawing from the `initialFullWordPool`. This process also makes sure these
 * words are immediately rendered in their respective regions using `renderWordsInRegions()`.
 * 8.  Filters out words already placed on the board from `initialFullWordPool` to create
 * `currentWordPool`, then **deterministically shuffles** the remaining words
 * (main seed + 2).
 * 9.  Performs a critical check to ensure enough unique words are available for the initial hand.
 * 10. Selects the initial `weightedHand` of words, applying probabilities based on `activeRules`
 * and using a **deterministic seeded random generator** (main seed + 3) to ensure
 * hand selection is reproducible.
 * 11. Performs another critical check for sufficient words in the `weightedHand`.
 * 12. Removes the selected hand words from `currentWordPool`.
 * 13. Assigns unique IDs to each word in the `weightedHand`, adds them to `currentHand`
 * and `wordsInPlay`.
 * 14. Finally, renders the `currentHand` to the user interface using `renderHand()`.
 *
 * This function calls:
 * - `getDailySeed()`: To retrieve the daily deterministic seed (if `isDaily` is true).
 * - `generateActiveRulesWithOverlap()`: To determine the rules for the current game.
 * - `updateDailyBadge()`: To show/hide the daily badge.
 * - `resetGameState()`: To clear previous game data.
 * - `buildDeliberateWordPool()`: To create the initial set of available words.
 * - `seedInitialZones()`: To place words on the board at the start.
 * - `renderWordsInRegions()`: To display the pre-seeded words.
 * - `shuffleArray()`: To deterministically shuffle the word pool.
 * - `createSeededRandom()`: To get a seeded random number generator for deterministic processes.
 * - `generateWordPoolWithProbabilities()`: To select words for the hand based on rules.
 * - `showMessage()`: To display critical error messages to the user.
 * - `crypto.randomUUID()`: To generate unique IDs for words.
 * - `renderHand()`: To display the player's initial hand.
 */ 
async function startGame(isDaily) {
    console.log("startGame(isDaily)", isDaily);
    session.dailyMode = isDaily;

    // Use the daily seed for ALL randomization steps in daily mode
    const seed = isDaily ? getDailySeed() : Math.floor(Math.random() * 100000);
	
	// winding up the timer
	session.timerID = setInterval(updateTimer, 1000);
	session.startTime = Date.now();
    
    // For now, let's give every zone an equal weight of 1.
    session.zoneKeys.forEach(key => {
        session.zoneWeights[key] = 1;
    });

    // And now we set a specific weight for 'None' zone
    if (session.zoneWeights['0']) {
        session.zoneWeights['0'] = 0.5; // Words are half as likely to land in the 'None' zone
    }
    const allRulesKey = session.zoneKeys.find(key => key.split('-').length === numRules);
    if (allRulesKey) {
        session.zoneWeights[allRulesKey] = 2; // Words are twice as likely to land in the 'All' zone
    }

	console.log("weights:", session.zoneWeights);

    // Let's generate some rules, ok?
    session.activeRules = generateActiveRulesWithOverlap(seed, allPossibleRules);
	console.log("rules:", session.activeRules);

    updateDailyBadge(isDaily);
    resetGameState();
	
	// changing the layout depending on how many rules the slider is set to
	const linkElement = document.getElementById('layout-stylesheet');
    if (numRules === 2) {
		linkElement.href = 'layout-2-rules.css';
	} 
	else if (numRules === 3){
		linkElement.href = 'layout-3-rules.css';
	}
	else if (numRules === 4){
		linkElement.href = 'layout-4-rules.css';
	}

    // Use deterministic seed for the full word pool
	const initialFullWordPool = buildDeliberateWordPool(session.activeRules, seed + 1);

    // a few words get played as hints at the start of the game
    seedInitialZones(initialFullWordPool);
	renderWordsInRegions(); // we have to actually draw those words

    // Remove seeded (already placed) words from pool, deterministic shuffle for remaining pool
    session.currentWordPool = initialFullWordPool.filter(w => !session.wordsInPlay.some(obj => obj.text === w));
    shuffleArray(session.currentWordPool, seed + 2);

    if (session.currentWordPool.length < INITIAL_HAND_SIZE) {
        showMessage("Critical Error: Not enough unique words for game. Please refresh.", true);
        return;
    }

    // Use deterministic seed for hand selection
    const weightedHand = generateWordPoolWithProbabilities(
        session.activeRules,
        session.currentWordPool,
        INITIAL_HAND_SIZE,
        createSeededRandom(seed + 3)
    );
    console.log("Weighted Hand GENERATED:", weightedHand);

    if (weightedHand.length < INITIAL_HAND_SIZE) {
        showMessage("Critical Error: Not enough unique words for game. Please refresh.", true);
        return;
    }

    // Remove words selected for the hand from the currentWordPool
    // This is to prevent duplicates in hand
    session.currentWordPool = session.currentWordPool.filter(word => !weightedHand.includes(word));

	// Corrected loop for populating currentHand and wordsInPlay
	for (const wordObjFromWeightedHand of weightedHand) {
		const wordObj = { 
			id: crypto.randomUUID(), 
			text: wordObjFromWeightedHand.text, 
			correctZoneKey: wordObjFromWeightedHand.correctZoneKey 
		};
		session.currentHand.push(wordObj);
		session.wordsInPlay.push(wordObj);
	}
	console.log("Weighted Hand before renderHand:", weightedHand);
    renderHand();

	//This message will remain on display until it gets overwritten
	showMessage("Select a card in Your Hand, then play it in one of the other 8 zones.", displayTime = 0);
	
	//the rules list popup in the settings menu
	const rulesListContainer = document.getElementById('rules-list-container');
	if (rulesListContainer) {
		rulesListContainer.innerHTML = buildRulesHTML();
	}

}//async function startGame(isDaily)


/**
 * @brief Manages the display and user interaction for the game over state.
 *
 * This asynchronous function is called when the game concludes, either due to a
 * win condition or a loss condition. It's typically invoked by the core game
 * logic after determining the game's outcome (e.g., when the player
 * successfully sorts all items, or when they run out of guesses/turns).
 *
 * @param {boolean} isWin - A boolean indicating whether the player won (true)
 * or lost (false) the game.
 *
 * The function performs the following actions:
 *
 * 1.  **Displays Game Outcome Message**: It updates `messageBox` with a
 * "You Win!" or "Game Over!" message, including the total `turns` taken,
 * and makes the message visible.
 *
 * 2.  **Clears and Summarizes Hand Area**: The visual representation of the
 * player's hand (`zoneElements['hand'].wordsDiv`) is cleared, and its
 * container is styled for the game-over summary. The game outcome message
 * is also optionally displayed within this area.
 *
 * 3.  **Constructs End Game Buttons**:
 * * A **Share Button** is created, allowing users to copy their game
 * results (win/loss, turns, and a game URL) to the clipboard. The
 * share text adjusts for `dailyMode` games.
 * * A **New Game Button** is created, which, when clicked, hides the
 * end-game buttons and calls `startGame(false)` to initiate a new game.
 *
 * 4.  **Renders Buttons**: Both the Share and New Game buttons are inserted
 * into the `end-screen-buttons` container, which is then made visible.
 *
 * 5.  **Updates Rule Box Labels**: It iterates through `zoneConfigs` to
 * update the `.box-label` for each game zone. For specific single-category
 * zones ('1', '2', '3'), it displays the `name` of the `activeRules`. For
 * other zones, it uses their `customLabel`.
 *
 * 6.  **Clears Hints**: All `.rule-hint` elements across all game zones,
 * including the hand container, are cleared of text and hidden, ensuring
 * no hints remain from the active game.
 */
async function endGame(isWin) {
	console.log("endGame",isWin);
	
	clearInterval(session.timerID);
	
    const endButtonsContainer = document.getElementById('end-screen-buttons');

    // Handle daily streak logic
    if (session.dailyMode) {
        const today = getTodayDateString();
        if (isWin) {
            if (lastDailyCompletionDate !== today) {
                dailyStreak++;
                localStorage.setItem('dailyStreak', dailyStreak);
                localStorage.setItem('lastDailyCompletionDate', today);
                console.log(`Daily streak incremented to: ${dailyStreak}`);
            } else {
                console.log("Daily puzzle already completed today. Streak not incremented.");
            }
        } else {
            // If daily puzzle failed, reset streak
            dailyStreak = 0;
            localStorage.setItem('dailyStreak', dailyStreak);
            localStorage.setItem('lastDailyCompletionDate', ''); // Clear last completion date
            console.log("Daily puzzle failed. Streak reset to 0. Try the difficulty sliders in the Settings menu.");
        }
    }


    // ✅ Show message box
    const messageText = isWin
        ? `🎉 You Win! Game Over in ${session.turns} turns!`
        : `💀 Game Over! You ran out of guesses. Try the difficulty sliders in the Settings menu. Total turns: ${session.turns}`;
    messageBox.textContent = messageText;
    messageBox.classList.add("visible");

    // ✅ Clear hand visually
    zoneElements['hand'].wordsDiv.textContent = '';
    zoneElements['hand'].container.classList.add("game-over-summary");

    // ✅ Optional: also show message in hand area
    const summaryHeader = document.createElement('div');
    summaryHeader.classList.add("summary-header");
    summaryHeader.textContent = messageText;
    zoneElements['hand'].wordsDiv.appendChild(summaryHeader);

    // ✅ Build share button
    const shareButton = document.createElement('button');
    shareButton.classList.add("icon-btn", "share-results-btn");
    // Changed to direct Unicode character for clipboard
    shareButton.textContent = `📋`; 
    shareButton.title = "Share Results";
    shareButton.addEventListener('click', () => {
        console.log("share button clicked, dailyMode =", session.dailyMode);
 	    const dateLabel = session.dailyMode ? ` – ${getTodayDateString()}` : " (Anytime Mode)";
        const gameLabel = GAME_TITLE + dateLabel;
        const winLossStatus = isWin ? "Won" : "Lost";
	    // Calculate incorrect guesses directly from lives (I'm assuming that these two variables actually represent their names)
        const incorrectGuessesMade = userSetLives - session.livesRemaining;
	    
        let fullShareText = `${gameLabel}: ${winLossStatus} with ${numRules} rules, and ${userSetLives} lives, in ${session.formattedTime}!`;
		fullShareText+= '\n' + session.previousResults;
        if (session.dailyMode && isWin) {
            fullShareText += `\n${dailyStreak} Daily puzzles in a row!`;
        }
		if (session.dailyMode) fullShareText += `\nCome back tomorrow for another puzzle.`;
        fullShareText += `\n${URL}`;
        copyToClipboard(fullShareText);
    });

    // ✅ Build new game button
    const newGameButton = document.createElement('button');
    newGameButton.classList.add("btn");
    newGameButton.textContent = `🔄`;
    newGameButton.title = "Start New Game";
    newGameButton.addEventListener('click', () => {
        endButtonsContainer.classList.remove("visible"); // hide buttons
        startGame(false);
    });

    // ✅ Insert buttons into #end-screen-buttons and show it
    endButtonsContainer.textContent = '';
    endButtonsContainer.appendChild(newGameButton);
    endButtonsContainer.appendChild(shareButton);
    endButtonsContainer.classList.add("visible"); // ✅ Show buttons now

    // ✅ Update rule box labels (show the rule.text for the single-rule zones) and clear hints
	//const singleCategoryKeys = ['1', '2', '3']; // This array helps me check which zones should have a single rule label.
	//actually, let's make it dynamic:
	let singleCategoryKeys = [];
	for (let i =0; i<numRules ; i++ ) singleCategoryKeys.push(i+1);
	console.log("singleCategoryKeys: ",singleCategoryKeys);
	console.log("zoneConfigs: ",zoneConfigs);
	
	for (const key in zoneConfigs) {
		const zoneConfig = zoneConfigs[key];
		const targetElement = zoneElements[key].container;

		if (targetElement) {
			const labelSpan = targetElement.querySelector('.box-label');
			const hintDiv = targetElement.querySelector('.rule-hint');

			if (labelSpan) {
				// Check if this is a single-rule zone
				if (singleCategoryKeys.includes( Number(key) ) ) {
					// This is the single-rule logic
					// The check `zoneConfig.ruleIndices[0]` is now safe because we know the array has one element.
					labelSpan.textContent = session.activeRules[zoneConfig.ruleIndices[0]].name;
				} else {
					// This is the multi-rule or "none" zone logic
					// Revert to using the customLabel property
					labelSpan.textContent = zoneConfig.customLabel;
				}
			}

			if (hintDiv) {
				hintDiv.textContent = '';
				hintDiv.classList.remove("visible");
			}
		}
	}

    // ✅ Also clear hint from hand container
    const handHintDiv = zoneElements['hand'].container.querySelector('.rule-hint');
    if (handHintDiv) {
        handHintDiv.textContent = '';
        handHintDiv.classList.remove("visible");
    }
}//async function endGame(isWin)


//
// generateActiveRulesWithOverlap()
// -----------------------------------------
// Called by: startGame()
// Returns: an array of N rules from rules.js, while guaranteeing that each set of rules contains overlapping rules, so each zone can be filled
//
function generateActiveRulesWithOverlap(seed, allRules, maxAttempts = 1000) {
    console.log(`🔎 Attempting to find ${numRules} rules`);

    const spellingRules = allRules;
    const checkedCombinations = new Set(); // Stores combinations we've already checked

    let attempt = 0;
    while (attempt < maxAttempts) {
        // Shuffle the spelling rules and pick the first numRules
        const shuffledSpelling = shuffleArray([...spellingRules], seed + attempt);
        const candidateSet = shuffledSpelling.slice(0, numRules);

        // Create a unique identifier for this combination
        const combinationId = candidateSet.map(rule => rule.name).sort().join('-');

        // If we've already checked this combination, skip to the next attempt
        if (checkedCombinations.has(combinationId)) {
            attempt++;
            continue;
        }

        // Add this new combination to the set
        checkedCombinations.add(combinationId);

        // Your existing logic for checking for overlaps and word counts
        const zoneConfigs = getZoneConfigs(numRules);
        const zoneBuckets = sortWordListByZone(candidateSet);
        
        const allZonesHaveMinWords = Object.keys(zoneConfigs).every(zoneKey => {
            if (zoneKey !== '0') {
                return (zoneBuckets[zoneKey]?.length || 0) >= MIN_RULE_MATCHING_WORDS_PER_CATEGORY;
            }
            return true;
        });

		//does the ruleset include at least the minimum number of words that fall into each zone, including 'distractor' words that don't meet any of the rules?
        if (allZonesHaveMinWords && (zoneBuckets['0']?.length > 1) ) {
            console.log(`✅ Found overlapping rules on attempt ${attempt + 1}`);
            console.log("🔎 Potential word distribution for selected rules (pre-weighted):");
            for (const key of Object.keys(zoneBuckets)) {
                const count = zoneBuckets[key]?.length || 0;
                console.log(`  Zone ${key}: ${count} word(s)`);
            }
            return candidateSet;
        }

        attempt++;
    }

    console.warn(`⚠️ No sufficiently overlapping rule set found after max attempts. Falling back.`);
    return spellingRules.slice(0, numRules);
}


// =========================================
// buildDeliberateWordPool()
// -----------------------------------------
// Called by: startgame()
// Returns: an array of words with guaranteed zone coverage - and attaches a correctZoneKey property to each word
// Ensures at least 1 Zone 0 word, even if all 3 rules are broad
// =========================================

function buildDeliberateWordPool(rules, seed) {
    const rng = mulberry32(seed || Date.now());
    
    // Dynamically generate desired counts based on the number of rules
    const desiredCounts = {};
    
    // We can assume a single desired count for all zones in the same tier.
    // Let's stick with 3 as your example. You can change this number later.
    const defaultCount = 3; 

    // Generate the desiredCounts object based on the dynamically created zones
    for (const key in zoneConfigs) {
        desiredCounts[key] = defaultCount;
    }
	
    // Get all words used by the current active rules
    const usedRuleWords = new Set();
    for (const rule of rules) {
        if (Array.isArray(rule.words)) {
            rule.words.forEach(w => usedRuleWords.add(w));
        }
    }


// just copy all the words from the wordlist and shuffle them
	const allWords = wordList;
	const shuffledWords = allWords
        .map(word => ({ word, sortKey: rng() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(obj => obj.word);

    const zoneBuckets = {};
    const selected = [];

//this loop breaks when all the zones are filled
    for (const word of shuffledWords) {
        const zoneKey = getCorrectZoneKeyForWord(word, rules);
		//console.log(word,zoneKey);
        if (!(zoneKey in desiredCounts)) continue;

        if (!zoneBuckets[zoneKey]) {
            zoneBuckets[zoneKey] = [];
        }

        if (zoneBuckets[zoneKey].length < desiredCounts[zoneKey]) {
            // Here's the key change: push an object with both the word and its zone key.
            const wordObject = {
                text: word,
                correctZoneKey: zoneKey
            };
            zoneBuckets[zoneKey].push(wordObject);
            selected.push(wordObject);
        }

        const allZonesFilled = Object.entries(desiredCounts).every(([zone, count]) =>
            (zoneBuckets[zone] || []).length >= count
        );
        if (allZonesFilled) break;
    }
    
    console.log("✅ buildDeliberateWordPool complete. Zone distribution:");
    for (const [zone, target] of Object.entries(desiredCounts)) {
        const actual = (zoneBuckets[zone] || []).length;
        console.log(`  Zone ${zone}: ${actual} / ${target}`);
    }

    return selected;
}

// =========================================
// sortWordListByZone()
// -----------------------------------------
// Called by: buildDeliberateWordPool()
// Calls: shuffleArray()
// 
// Purpose:
// Groups all words from the entire wordlist into buckets
// according to their zone (e.g., "1", "1-2", "1-2-3", or "0" for unmatched).
// Returns an object: { "1": [...], "2-3": [...], "0": [...] }
// =========================================
function sortWordListByZone(rules) {
    const allWords = wordList;

    const zoneBuckets = {};

    // Classify each word into a zone
    for (const word of allWords) {
		const zoneKey = getCorrectZoneKeyForWord(word,rules);
        if (!zoneBuckets[zoneKey]) zoneBuckets[zoneKey] = [];
        zoneBuckets[zoneKey].push(word);
/*Many words from the wordslist don't apply to any of the rules, and we probably don't need to be notified about all of them each time
        if (zoneKey === "0") {
            console.log(`🟨 "${word}" is unmatched and placed in Zone 0`);
			
        }
*/
    }

/*
    // Log full zone distribution
    console.log("🔎 zoneBuckets (raw counts):");
    Object.entries(zoneBuckets).forEach(([key, val]) => {
        console.log(`  Zone ${key}: ${val.length} word(s)`);
    });
*/
    return zoneBuckets;
}

// This function needs to be called after the word objects in the pool have their `correctZoneKey` property set.
function seedInitialZones(pool) {
	//console.log("Initial Full Word Pool:", pool);
	console.log("weights in seedInitialZones:", session.zoneWeights);
	
	//at the start of the game, place a word into these zones, and also the All Rules zone
//TODO: this list should maybe be created dynamically
	let initialZoneKeys = ['1', '2', '3', '4', '0'];
    
    // Generate the correct data-zone-key based on the number of circles
    let allRulesKey = '';
    for (let i = 1; i <= numRules; i++) {
        allRulesKey += i;
        if (i < numRules) {
            allRulesKey += '-';
        }
    }
	initialZoneKeys.push(allRulesKey);
	
	
	const wordsPlaced = new Set();
    	
    for (const targetZoneKeyKey of initialZoneKeys) {
        //the two lines work together to create a randomized list of words that have not yet been used
		const candidates = pool.filter(w => !wordsPlaced.has(w.text)); // Filter by word.text
        const shuffled = shuffleArray([...candidates]);
		
        let chosenWord = null;
		chosenWord = shuffled.find(word => word.correctZoneKey === targetZoneKeyKey);
		/*
        if (targetZoneKeyKey === '1-2-3') {
            // Find a word that has been pre-calculated to be in the '1-2-3' zone
            chosenWord = shuffled.find(word => word.correctZoneKey === '1-2-3');
			console.log(`For targetZoneKeyKey === '1-2-3', chosenWord = ${chosenWord}`);
        } else {
            // Find a word that has been pre-calculated to be in one of the single zones
            chosenWord = shuffled.find(word => word.correctZoneKey === targetZoneKeyKey);
        }*/

        if (chosenWord) {
            wordsPlaced.add(chosenWord.text); // Add the word's text to the set
            session.wordsInPlay.push({
                id: crypto.randomUUID(),
                text: chosenWord.text,
                correctZoneKey: chosenWord.correctZoneKey,
                isInitialSeed: true
            });
			
			//remove the word from the pool, so it doesn't get drawn again
			const indexToRemove = pool.findIndex(w => w.text === chosenWord.text);
			if (indexToRemove !== -1) {	pool.splice(indexToRemove, 1); }
			
            session.zoneWeights[targetZoneKeyKey] /= 4; // If a word gets placed in a zone, make that zone likely to be chosen again, when we're drawing cards for the hand
            console.log(`Initial placement of ${chosenWord.text} in zone ${targetZoneKeyKey}, weight changed to ${session.zoneWeights[targetZoneKeyKey]}`);
        } else {
            console.warn(`[startGame] Could not find word for zone ${targetZoneKeyKey}`);
        }
    }
}//function seedInitialZones(pool) 

/*
function seedInitialZones(pool) {
    const initialZoneKeys = ['1', '2', '3','1-2-3'];
    const wordsPlaced = new Set();
    for (let i = 0; i < initialZoneKeys.length; i++) {
        const targetCorrectZoneKeyForWord = initialZoneKeys[i];
        const targetRuleIndex = parseInt(targetCorrectZoneKeyForWord) - 1;
        const candidates = pool.filter(w => !wordsPlaced.has(w));
        const shuffled = shuffleArray([...candidates], 20 + i);
        let chosenWord = shuffled.find(word => matchesOnlyOneRule(word, targetRuleIndex))
            || shuffled.find(word => activeRules[targetRuleIndex].test(chosenWord));

        if (chosenWord) {
            wordsPlaced.add(chosenWord);
            wordsInPlay.push({
                id: crypto.randomUUID(),
                text: chosenWord,
                correctZoneKey: targetCorrectZoneKeyForWord,
                isInitialSeed: true // Mark as initially seeded for rendering logic
			});
			zoneWeights[targetCorrectZoneKeyForWord] /= 4; // If a word gets placed in a zone, make it half as likely to be chosen again
			console.log(`Initial placement of ` + chosenWord + ' in zone ' + targetCorrectZoneKeyForWord + ', weight changed to ' + zoneWeights[targetCorrectZoneKeyForWord] );
        } else {
            console.warn(`[startGame] Could not find word for Rule ${targetCorrectZoneKeyForWord} (${activeRules[targetRuleIndex]?.name || 'N/A'})`);
        }
        console.log(`rule ${i + 1} : ${activeRules[i]?.name}`);
    }
}
*/

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function getDailySeed() {
    const today = getTodayDateString().replace(/-/g, '');
    return parseInt(today, 10);
}

// Updated utility function to handle both strings and objects
function doesWordMatchRule(wordOrObject, rule) {
    // Get the word text, whether it's a string or an object
    const word = typeof wordOrObject === 'string' ? wordOrObject : wordOrObject.text;

    // First, check if the word is explicitly listed in the rule's 'words' array
    if (Array.isArray(rule.words) && rule.words.includes(word)) {
        return true;
    }
    // If not explicitly listed, then check the 'test' function if it exists
    if (typeof rule.test === 'function') {
        return rule.test(word);
    }
    return false;
}


// Weighted random draw utility using a provided seedable RNG
function weightedRandomPick(weights, rng) {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0);
    const roll = rng() * total;
    let cumulative = 0;
    for (const key in weights) {
        cumulative += weights[key];
        if (roll < cumulative) return key;
    }
    return Object.keys(weights)[0]; // fallback
}

// Main generator function
// This function is your Curated Dealer. Its job isn't just to give the player random cards, but to ensure the player's hand has a "fair" distribution of difficulty by picking words based on which zones they belong to. Without this function, a player might end up with a hand where every single word belongs in the "None" zone, which would be boring and wouldn't help them deduce the rules.
function generateWordPoolWithProbabilities(ruleResults, wordPool, count, rng) {

	//first, we generate an array of desired zoneProbabilities, dynamically based on numRules
	//TODO: we probably want to tweak these probabilities
	const zoneProbabilities = {};
    const totalCombinations = Math.pow(2, numRules);
    
    // Calculate the number of combinations that are not the two "special" cases.
    const numberOfOtherCombinations = totalCombinations - 2;
    
	// how likely do we want it to be that a word gets sorted into the All Rules zone?
	const specialProb = 5;
	
    // Calculate the probability for each of the "other" combinations.
    const otherProb = (100 - (2 * specialProb)) / numberOfOtherCombinations;

    // Use a loop with bitwise operations to generate all rule combinations.
    // Each number from 1 to (2^numRules - 1) represents a unique combination of rules.
    for (let i = 1; i < totalCombinations; i++) {
        const rulesInCombination = [];
        for (let j = 0; j < numRules; j++) {
            // If the j-th bit is set, it means the j-th rule is in the combination.
            if ((i >> j) & 1) {
                rulesInCombination.push(j + 1);
            }
        }
        
        const key = rulesInCombination.join('-');
        
        // Assign the correct probability based on whether it's the all-match combination or not.
        if (rulesInCombination.length === numRules) {
            zoneProbabilities[key] = specialProb;
        } else {
            zoneProbabilities[key] = otherProb;
        }
    }
	console.log('zoneProbabilities ', zoneProbabilities);
	
  
    // Now, use the wordPool to group words by their new zone key property.
    const zoneBuckets = {};
    
    for (const word of wordPool) {
        const zoneKey = word.correctZoneKey; 
        if (!zoneBuckets[zoneKey]) zoneBuckets[zoneKey] = [];
        zoneBuckets[zoneKey].push(word);
    }
    
    // Shuffle each bucket to randomize word order
    for (const key in zoneBuckets) {
        zoneBuckets[key] = shuffleArray(zoneBuckets[key], rng());
    }
    
    const selected = [];
    const used = new Set();
    
    // Flatten all zone keys in weighted order
    const weightedZoneKeys = Object.keys(zoneProbabilities).sort(
        (a, b) => zoneProbabilities[b] - zoneProbabilities[a]
    );
    
    // Main loop
    while (selected.length < count) {
        const zoneKey = weightedRandomPick(zoneProbabilities, rng);
        const bucket = zoneBuckets[zoneKey] || [];
        
        // Find first unused word from the bucket
        const candidate = bucket.find(word => !used.has(word.text));
        
        if (candidate) {
            selected.push(candidate);
            used.add(candidate.text);
        } else {
            // Fallback: check all buckets for unused words
            const fallback = Object.values(zoneBuckets)
            .flat()
            .find(word => !used.has(word.text));
            
            if (!fallback) break; // No words left at all
            selected.push(fallback);
            used.add(fallback.text);
        }
    }
    
    // In this logging loop, use the pre-calculated key.
    for (const word of selected) {
        console.log('generateWordPoolWithProbabilities ', word.text, '→', word.correctZoneKey);
    }
    
    return selected;
}


function createSeededRandom(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    
    return function() {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
}

function shuffleArray(array, seed = null) {
    const random = seed !== null ? createSeededRandom(seed) : Math.random;
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}



// Updated function to handle both strings and objects
function getCorrectZoneKeyForWord(wordOrObject, rules) {
    // Get the word text, whether it's a string or an object
    const word = typeof wordOrObject === 'string' ? wordOrObject : wordOrObject.text;

    let matchedZones = [];

    rules.forEach((rule, index) => {
        if (doesWordMatchRule(word, rule)) {
            matchedZones.push(index + 1);
        }
    });

    return matchedZones.length ? matchedZones.join('-') : '0';
}



function getZoneDisplayName(zoneKey) {
	console.log('getZoneDisplayName called with ', zoneKey);
    const zoneConfig = zoneConfigs[zoneKey];
    if (!zoneConfig) {
        console.error(`Attempted to get display name for unknown zoneKey: ${zoneKey}`);
        return "Unknown Category";
    }
    
    if (zoneConfig.customLabel) {
        return zoneConfig.customLabel;
    }
 
    return "General Category"; // just a fallback; should never actually happen
}



//Apparently the Math.Random in js isn't seedable for some reason
function mulberry32(seed) {
    return function() {
        let t = seed += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

//this is the function that I call whenever I want to display a message at the bottom of the screen, either after a guess or at the start of the game
//displayTime defaults to MESSAGE_DISPLAY_TIME, which I set at the top of the program; but if I pass in a 0, then the message stays on the screen until it's overwritten
function showMessage(message, color = null, displayTime = MESSAGE_DISPLAY_TIME) {
	console.log('displayTime=',displayTime);
    
	// If color is actually a number (if the call omits setting a color, and instead just sets a displaytime), shift args
    if (typeof color === "number") {
        displayTime = color;
        color = null;
    }
	
	messageBox.innerHTML = message;
    messageBox.classList.remove("error");
	messageBox.classList.remove("warning");
	
    if (color=='yellow') {
        messageBox.classList.add("warning");
    }
	if (color=='red') {
        messageBox.classList.add("error");
    }
    clearTimeout(messageBox.timeoutId);

	messageBox.classList.add("visible");

    if (displayTime > 0) {
        messageBox.timeoutId = setTimeout(() => {
            messageBox.classList.remove("visible");
        }, displayTime);
    }
}

//The renderHand() function is the "Visual Refresh" for the player's cards. It translates the data stored in your currentHand array into actual interactive HTML elements on the screen.
function renderHand() {
    const handWordsDiv = zoneElements['hand'].wordsDiv;
    handWordsDiv.textContent = '';
    
    zoneElements['hand'].container.classList.remove("game-over-summary");
    
    session.currentHand.forEach(wordObj => {
        const card = document.createElement('div');
        card.classList.add("word-card");
        card.id = `card-${wordObj.id}`;
        card.innerHTML = `<span class="word-text">${wordObj.text}</span>`;
        
        // Make cards draggable
        card.setAttribute('draggable', 'true');
        card.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', wordObj.id);
            selectedWordId = wordObj.id; // Also set selectedWordId for consistency
            card.classList.add('dragging'); // Add a class for styling feedback
        });
        card.addEventListener('dragend', (event) => {
            card.classList.remove('dragging');
        });

        // Click-to-select functionality (still available)
        card.addEventListener('click', () => selectWord(wordObj.id));
        handWordsDiv.appendChild(card);
    });
}

//this helper function is only ever called by renderHand
function selectWord(id) {
    if (selectedWordId) {
        document.getElementById(`card-${selectedWordId}`)?.classList.remove("selected");
    }
    
    selectedWordId = id;
    document.getElementById(`card-${selectedWordId}`).classList.add("selected");
    showMessage(`Selected: ${session.wordsInPlay.find(w => w.id === id).text}. Now click a box to place it.`);
}

/**
 * Creates a word card DOM element.
 * @param {string} wordText The text content of the word.
 * @param {string} id The unique ID for the card element.
 * @param {string} zoneKey The zone key to determine the card's text color.
 * @param {boolean} isPlayedFromHand True if the card was played from the hand, false if initially seeded.
 * @returns {HTMLElement} The created word card element.
 */
function createWordCard(wordText, id, zoneKey, isPlayedFromHand) {
    const card = document.createElement('div');
    card.classList.add('word-card', 'placed-card');
    card.id = `card-${id}`;
    card.innerHTML = `<span class="word-text">${wordText}</span>`;

    if (isPlayedFromHand) {
        card.classList.add('played-from-hand'); // Add this class for cards played from hand
    } else {
        // Only apply zone-specific background if NOT played from hand (i.e., initial seed)
        const zoneConfig = zoneConfigs[zoneKey];
        if (zoneConfig?.colorVar) {
            card.style.backgroundColor = `var(${zoneConfig.colorVar})`;
        }
    }

    // Use matching text color for that zone (this applies to all cards)
    const zoneClassName = `--zone${String(zoneKey).replace(/-/g, '')}-text`;
    card.style.color = `var(${zoneClassName})`;

    return card;
}


function renderWordsInRegions() {
    // Step 1: Clear previous placed cards
    for (const key in zoneConfigs) {
        const zoneWordsDiv = zoneElements[key]?.wordsDiv;
        if (zoneWordsDiv) {
            zoneWordsDiv.querySelectorAll('.word-card.placed-card').forEach(card => card.remove());
        }
    }

    // Step 2: Add each placed word (those with a correctZoneKey)
    const playedWords = session.wordsInPlay.filter(wordObj => wordObj.correctZoneKey !== null);

    playedWords.forEach(wordObj => {
        const zoneKey = wordObj.correctZoneKey;
        const zoneElement = zoneElements[zoneKey];
        if (zoneElement && zoneElement.wordsDiv) {
            // Determine if the card was played from hand or initially seeded
            // If wordObj.isInitialSeed is true, then it was NOT played from hand.
            // If wordObj.isInitialSeed is undefined/false, it was played from hand.
            const isPlayedFromHand = !wordObj.isInitialSeed; 
            const card = createWordCard(wordObj.text, wordObj.id, zoneKey, isPlayedFromHand);
            zoneElement.wordsDiv.appendChild(card);
        } else {
            console.warn(`❗ No valid zone element for key "${zoneKey}" when rendering word "${wordObj.text}".`);
        }
    });
}

/*
// Show a feedback bubble near a zone or element (I might want to put this back in at some point, but for now I'm just using showMessage()
function showZoneFeedback(message, targetElement, isError = false) {
    const bubble = document.getElementById('zone-feedback-bubble');
    if (!bubble || !targetElement) return;

    bubble.textContent = message;

    // Apply plain CSS classes instead of Tailwind
    bubble.className = isError ? 'zone-feedback-bubble error' : 'zone-feedback-bubble success';

    const rect = targetElement.getBoundingClientRect();
    bubble.style.top = `${rect.top + window.scrollY + rect.height / 2}px`;
    bubble.style.left = `${rect.left + window.scrollX + rect.width / 2}px`;
    bubble.style.opacity = '1';

    setTimeout(() => {
        bubble.style.opacity = '0';
    }, 3000);
}
*/
function placeWordInRegion(targetZoneKey) {
    if (!selectedWordId) {
        showMessage('Please select a word first!', 'red');
        return;
    }
    if (targetZoneKey === 'hand') {
        showMessage('You cannot place words into your hand. Select a rule box or "None"!', 'red');
        return;
    }
    session.turns++;

    const selectedWordObj = session.wordsInPlay.find(w => w.id === selectedWordId);
    const correctZoneKey = getCorrectZoneKeyForWord(selectedWordObj.text, session.activeRules);
    const correctZoneElement = zoneElements[correctZoneKey]?.container;
    const targetZoneKeyElement = zoneElements[targetZoneKey]?.container;
	
	//regardless of correctness, the word was placed in the correctZoneKey, so make the correctZoneKey's cards less likely to be chosen again
	session.zoneWeights[correctZoneKey] /= 4; 
	console.log(` placement of ` + selectedWordObj.text + ' in zone ' + correctZoneKey + ', weight changed to ' + session.zoneWeights[correctZoneKey] );


    session.currentHand = session.currentHand.filter(w => w.id !== selectedWordId);
    const cardElement = document.getElementById(`card-${selectedWordId}`);
    if (cardElement) {
        cardElement.classList.remove("selected");
        cardElement.style.opacity = "0";  // <- visual feedback for removal

        setTimeout(() => {
            if (cardElement.parentNode === zoneElements['hand'].wordsDiv) {
                cardElement.remove();
            }
        }, 300);
    } else {
        console.warn(`[Place Word Debug] Card element with ID ${selectedWordId} not found for removal from hand.`);
    }

    let isCorrectPlacement = false;
    let message = '';
    let isErrorFeedback = false; // Control feedback color for both messageBox and bubble

    // --- DEBUG LOGS START ---
    console.log(`--- Placement Attempt ---`);
    console.log(`Word: '${selectedWordObj.text}'`);
    console.log(`Correct Zone Key: '${correctZoneKey}'`);
    console.log(`Target Zone Key (placed in): '${targetZoneKey}'`);
    // --- DEBUG LOGS END ---

    // This variable will hold the new card drawn from the pool
    // Initialize to null, it will only be assigned if a new card is to be drawn (on a miss)
    let newCardFromPool = null; 

    if (correctZoneKey === targetZoneKey) {
        // Perfect match: Hand size decreases, NO new card is drawn.
        isCorrectPlacement = true;
        selectedWordObj.correctZoneKey = correctZoneKey;
        message = `Correct! '${selectedWordObj.text}' belongs in this category.`;
        isErrorFeedback = false;
        console.log(`Outcome: Perfect Match ✅`); // Debug log
		session.previousResults+="✅";  // that's a green check for the share results
        
    } else {
        // Incorrect placement - now determine if it's a near miss or far miss

		// break the target and correct strings into parts and convert to numbers
		const targetZoneParts = targetZoneKey.split('-').map(Number);
		const correctZoneParts = correctZoneKey.split('-').map(Number);
		
		// make sets
		const targetSet = new Set(targetZoneParts);
		const correctSet = new Set(correctZoneParts);

		let isNearMiss = false;
		// Special case: 'None of the Above' (Zone 0)
		if (targetSet.has(0) && correctSet.size === 1) {
		    isNearMiss = true;
		} else {
		    // Compute symmetric difference count
		    const missing = [...targetSet].filter(z => !correctSet.has(z)).length;
		    const extra   = [...correctSet].filter(z => !targetSet.has(z)).length;
		    const diffCount = missing + extra;
		
		    // Near miss if exactly one zone differs
		    isNearMiss = diffCount === 1;
		}


        // --- DEBUG LOGS START ---
		console.log(`Target Zone Parts: [${targetZoneParts.join(', ')}]`);
        console.log(`Correct Zone Parts: [${correctZoneParts.join(', ')}]`);
        console.log(`Is Target Contained In Correct Overlap: ${isNearMiss}`);
        // --- DEBUG LOGS END ---

        if (isNearMiss) {
            // Near miss: Draw a new card, but no life lost.
            selectedWordObj.correctZoneKey = correctZoneKey; // Still mark with correct zone for visual placement
            
            const correctCategoryName = getZoneDisplayName(correctZoneKey, false);
            message = `Near Miss! '${selectedWordObj.text}' belongs in "${correctCategoryName}". Draw a new card.`;
            isErrorFeedback = 'yellow'; // Still show as a "mistake" visually
            console.log(`Outcome: Near Miss 🟡`); // Debug log
			session.previousResults+="🟡";  // that's a yellow circle for the share results

			newCardFromPool = drawCard(); // Draw a new card
        } else {
            // Far miss: Lose a life and draw a new card.
            selectedWordObj.correctZoneKey = correctZoneKey; // Still mark with correct zone for visual placement
            session.livesRemaining--; // Lose a life
            updateLivesDisplay();
            newCardFromPool = drawCard(); // Draw a new card

            const correctCategoryName = getZoneDisplayName(correctZoneKey, false);
            message = `Oops! '${selectedWordObj.text}' belongs in "${correctCategoryName}". Draw a new card.`;
            if (session.currentWordPool.length <= 3) {
                message += `   Only ${session.currentWordPool.length} card${session.currentWordPool.length === 1 ? '' : 's'} left!`;
            }
            message += ` Lives left: ${session.livesRemaining}.`;
            isErrorFeedback = 'red'; // Definitely an error
            console.log(`Outcome: Far Miss ❌`); // Debug log
			session.previousResults+="❌";  // that's a red X for the share results
        }
    }

    // This block now only executes if newCardFromPool was assigned (meaning a miss occurred)
	if (newCardFromPool) {
		// The newCardFromPool variable is already the word object.
		// We just need to add it to the hand and wordsInPlay arrays.
		newCardFromPool.id = crypto.randomUUID(); // Give it a new ID since it's a fresh card
		session.currentHand.push(newCardFromPool);
		session.wordsInPlay.push(newCardFromPool);
		console.log(`New card '${newCardFromPool.text}' added to hand.`);
	} else if (!isCorrectPlacement) {
        // This condition handles the case where it was a miss, but drawCard() returned null (deck empty)
        console.log("No new card drawn for a miss because currentWordPool is empty.");
        message += " (No more cards to draw!)"; // Inform the player
    }


    // Show feedback bubble (currently disabled by you)
    // showZoneFeedback(message, targetZoneKeyElement, isErrorFeedback);

    // Regardless of correctness, place the card visually
    const placedCard = createWordCard(selectedWordObj.text, selectedWordObj.id, selectedWordObj.correctZoneKey, true);
    if (!isCorrectPlacement) { // If it was incorrect (either near or far miss)
        placedCard.classList.add("incorrect");
    }
    correctZoneElement.querySelector('.word-cards-container').appendChild(placedCard);
	

    // The main messageBox message should reflect the outcome
    showMessage(message, isErrorFeedback); // Use isErrorFeedback for messageBox too

    selectedWordId = null;
    renderHand(); // Re-render hand to show the updated hand (fewer cards on perfect, same on miss)

    checkGameEndCondition();
}//function placeWordInRegion(targetZoneKey)

//I'm replacing the old drawCard function; this new function checks the zoneWeight before it actually draws the card
//when you play a card into a zone, you're less likely to draw another card for that zone:   zoneWeights[targetZoneKeyKey] /= 4; // If a word gets placed in a zone, make that zone likely to be chosen again, when we're drawing cards for the hand
function drawCard() {
    // Loop until a card is successfully drawn or the deck is empty
    while (session.currentWordPool.length > 0) {
        let cardToConsider = session.currentWordPool[0]; // Get the top card
        const cardZoneKey = cardToConsider.correctZoneKey;

        // Get the weight for this card's zone
        const zoneWeight = session.zoneWeights[cardZoneKey] !== undefined ? session.zoneWeights[cardZoneKey] : 1.0;

        // Calculate the probability of *not* drawing this card (moving it to bottom)
        const chanceToMoveToBottom = 1 - zoneWeight;

        // Generate a random number between 0 and 1
        const randomNumber = Math.random();

        console.log(`Considering drawing '${cardToConsider.text}'. Zone: '${cardZoneKey}', Weight: ${zoneWeight.toFixed(2)}, Chance to move to bottom: ${chanceToMoveToBottom.toFixed(2)}, Random: ${randomNumber.toFixed(2)}`);

        if (randomNumber < chanceToMoveToBottom) {
            // If the random number suggests moving to bottom, do so
            const movedCard = session.currentWordPool.shift(); // Remove from top
            session.currentWordPool.push(movedCard);          // Add to bottom
            console.log(`'${movedCard.text}' moved to bottom of deck due to zone weight.`);
            // The loop will continue to the next iteration to consider the new top card
        } else {
            // If the random number suggests drawing, draw the card and exit the loop
            const drawnCard = session.currentWordPool.shift(); // Remove from top and return
            console.log(`'${drawnCard.text}' drawn.`);
			
            return drawnCard; // A card was drawn, exit the function
        }
    }

    // If the loop finishes, it means currentWordPool.length was 0
    console.log("Deck is empty. Cannot draw more cards.");
    return null; // Or handle game end/shuffle
}



function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        showMessage('Results copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy text: ', err);
        showMessage('Failed to copy results. Please try again or copy manually.', 'red');
    }
    document.body.removeChild(textarea);
}

// Function to check for win or loss
async function checkGameEndCondition() { 
    if (session.currentHand.length === 0) {
        // Win condition (all cards placed correctly)
        endGame(true);
    } else if (session.livesRemaining <= 0) { // Loss condition: lives run out
        endGame(false);
    }
}



function updateDailyBadge(isDaily) {
	console.log('updateDailyBadge(isDaily) ', isDaily);
    const badge = document.getElementById("daily-badge");
    if (badge && isDaily ) {
        badge.style.display = 'inline-block';
		badge.textContent = `daily for ${getTodayDateString()}`;
    }
	else badge.style.display = 'none';
}

//currently, every variable that resetGameState resets is already being reset when the page is refreshed, so I'm not sure if we even need this function
function resetGameState() {
	document.querySelectorAll('.word-cards-container').forEach(container => { container.replaceChildren(); });
    session.turns = 0;
    selectedWordId = null;
    // Initialize lives and update display using userSetLives
    session.livesRemaining = userSetLives; 
    updateLivesDisplay(); 
    messageBox.classList.remove("visible");
    messageBox.style.height = '';
    messageBox.style.minHeight = '';
    messageBox.style.textAlign = '';
    hideModal();
    updateRuleBoxLabelsAndHints();
    session.wordsInPlay = [];
    session.currentHand = [];
    renderWordsInRegions();
}

// Function to update the lives display on the main game screen
function updateLivesDisplay() { 
    if (livesDisplay) {
        livesDisplay.textContent = session.livesRemaining;
    }
}

// Function to update the lives setting and save to local storage
function updateLivesSetting(value) {
    userSetLives = value;
    livesDisplayModal.textContent = userSetLives;
    localStorage.setItem('userSetLives', userSetLives);
}


function updateRuleBoxLabelsAndHints() {
	console.log('Debug in updateRuleBoxLabelsAndHints: zoneConfigs=', zoneConfigs);
    for (const key in zoneConfigs) {
        const zoneConfig = zoneConfigs[key];
        const targetElement = zoneElements[key].container;
        
        if (targetElement) {
            let labelSpan = targetElement.querySelector('.box-label');
            let hintDiv = targetElement.querySelector('.rule-hint');
           // let iconsContainer = targetElement.querySelector('.box-icons-container');
           
		    labelSpan.textContent = getZoneDisplayName(key);
            
            if (hintDiv) {
                let hintText = '';
				
				
				const numRulesMatched = zoneConfig.ruleIndices.length; 
				
				if (numRulesMatched === 1) {
					hintText = "Words in this category meet exactly 1 rule.";
					/* we don't really want to display hints on Tier 1 rules anymore
					let candidateHints = [];
					let currentActiveRuleName = activeRules[zoneConfig.ruleIndices[0]].name;
					
					allPossibleRules.forEach(rule => { candidateHints.push(rule.name); }	);
					
					const uniqueHints = Array.from(new Set(shuffleArray(candidateHints, Date.now() + key.length))).slice(0, 5);
					hintText = uniqueHints.length > 0 ? "Some example rules of this type:\n\n" + uniqueHints.join('\n') : 'No other rules of this type available.';
					*/
				} else if (numRulesMatched === 2) {
					hintText = "Words in this category meet exactly 2 rules.";
				} else if (numRulesMatched === 3) {
					hintText = "Words in this category meet exactly 3 rules.";
				} else if (numRulesMatched === 4) {
					hintText = "Words in this category meet exactly 4 rules.";
				} else if (numRulesMatched === 0) {
					hintText = 'Words that do not fit any of the rules provided.';
				}
                hintDiv.textContent = hintText;
            }
 /* We don't really need each zone to have an icon anymore, now that we're just using 3 different spelling rules           
            if (iconsContainer && zoneConfig.categoryTypes) {
                iconsContainer.innerHTML = getBoxIconsSVG(zoneConfig.categoryTypes);
            }
*/            
            if (targetElement && !targetElement.hasAttribute('data-hint-listeners-added')) {
                targetElement.addEventListener('mouseover', () => {  hintDiv.classList.add("visible"); });
                targetElement.addEventListener('mouseout', () => { hintDiv.classList.remove("visible"); });
                targetElement.setAttribute('data-hint-listeners-added', 'true');
            }
        }
    }
    const handLabel = zoneElements['hand'].container.querySelector('.box-label');
    if (handLabel) handLabel.textContent = 'Your Hand:';
    const handHint = zoneElements['hand'].container.querySelector('.rule-hint');
    if (handHint) {
        handHint.textContent = '';
        handHint.classList.remove("visible");
    }
}

function showModal() {
    settingsModalOverlay.style.display = 'flex';
    setTimeout(() => {
        settingsModalOverlay.classList.add("visible");
    }, 10);
    applyThemeToggleIcon(); // Update the icon when modal is opened
}

function hideModal() {
    settingsModalOverlay.classList.remove("visible");
    setTimeout(() => {
        settingsModalOverlay.style.display = 'none';
    }, 300);
}

/* I used to have a complicated Show Rules popup. Now I just open that text in a new tab. I can probably delete this code.
function showRulesPopup() {
    if (rulesPopupOverlay) {
        rulesPopupOverlay.classList.add('visible');
        console.log('Rules popup shown.');
    }
}

function hideRulesPopup() {
    if (rulesPopupOverlay) {
        rulesPopupOverlay.classList.remove('visible');
        console.log('Rules popup hidden.');
    }
}
*/

//when the Show Rules button is clicked, it calls this function, which opens the rules in a new tab
function openRulesInNewTab() {
  let rulesContent = 'All Rules\n';
  rulesContent += allPossibleRules.map(rule => `- ${rule.name}`).join('\n');
  rulesContent = rulesContent.trim();
  
  const newTab = window.open('', '_blank');
  newTab.document.body.style.whiteSpace = 'pre-wrap';
  newTab.document.body.textContent = rulesContent;
  newTab.document.title = 'All Rules';
}

function applyTheme() {
    const htmlElement = document.documentElement;

    if (isDarkMode) {
        htmlElement.classList.add('dark');
        htmlElement.classList.remove('light');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.classList.add('light');
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        localStorage.setItem('theme', 'light');
    }

    applyThemeToggleIcon(); // Update the icon after applying theme
}


// function to update the moon/sun icon in the modal
function applyThemeToggleIcon() {
    if (darkModeToggleBtn) { // Check if the button exists before trying to update its textContent
        darkModeToggleBtn.textContent = isDarkMode ? '☀️' : '🌙'; // Sun for dark, Moon for light
    }
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    applyTheme();
}

// Event Listeners
settingsBtn.addEventListener('click', showModal); // Gear icon now opens settings modal
modalCloseBtn.addEventListener('click', hideModal);
//newGameModalBtn.addEventListener('click', () => { startGame(false); }); //start a new game, but not in Daily mode

// Event listener for the dark mode toggle button inside the modal
if (darkModeToggleBtn) {
    darkModeToggleBtn.addEventListener('click', toggleDarkMode);
}

if (hintBtn) {
    hintBtn.addEventListener('click', (event) => {

        console.log('Hint button clicked from settings modal.');
		
        // Pick a random card from the hand
        const randIndex = Math.floor(Math.random() * session.currentHand.length);
        const card = session.currentHand[randIndex];

        // Get its correct zone (assuming your card object or helper function provides this)
        const targetZone = getCorrectZoneKeyForWord(card, session.activeRules); // or card.target if already stored

        // Show the hint
        const hintMessage = `Hint: One of your cards, "${card.text}", should go into Zone ${targetZone}.`;
        showMessage(hintMessage, null, 0); // displayTime = 0 keeps it until overwritten

		hideModal();
    });
}

if (showAllRulesBtn) {
    showAllRulesBtn.addEventListener('click', (event) => {

        console.log('Rules button clicked from settings modal.');
		openRulesInNewTab();
    });
}

if (concedeButton) {
	concedeButton.addEventListener('click', () => {
		// Show a confirmation dialog
        const userConfirmed = confirm("Are you sure you want to concede? You will lose this game.");
        // If the user clicks "OK", then proceed with ending the game
        if (userConfirmed) {
            // Call the endGame function with `false` to indicate a loss or concession
			endGame(false);
            
            // Hide the settings modal after conceding
            hideModal();
        }
    });
}


settingsModalOverlay.addEventListener('click', (event) => {
    if (event.target === settingsModalOverlay) {
		console.log('event.target === settingsModalOverlay');
        hideModal();
    }
});

// Add drag and drop event listeners to all zone containers (excluding hand)
for (const key in zoneElements) {
    const element = zoneElements[key].container;
    if (element && key !== 'hand') {
        element.addEventListener('click', () => placeWordInRegion(key)); // Keep click-to-place

        // Drag and drop listeners
        element.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow drop
            element.classList.add('drag-over'); // Visual feedback
        });
        element.addEventListener('dragenter', (event) => {
            event.preventDefault(); // Allow drop
            element.classList.add('drag-over'); // Visual feedback
        });
        element.addEventListener('dragleave', () => {
            element.classList.remove('drag-over'); // Remove visual feedback
        });
        element.addEventListener('drop', (event) => {
            event.preventDefault(); // Prevent default drop behavior
            element.classList.remove('drag-over'); // Remove visual feedback

            const draggedWordId = event.dataTransfer.getData('text/plain');
            if (draggedWordId) {
                selectedWordId = draggedWordId; // Set selectedWordId from drag data
                placeWordInRegion(key);
            }
        });
    }
}

function updateTimer() {
    const elapsedTime = Date.now() - session.startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    
    // Format the time to always show two digits for seconds
    session.formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    timerDisplay.textContent = session.formattedTime;
}
