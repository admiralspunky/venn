// game-logic.js

//
// Global Variables ('let' can be reassigned later; 'const' cannot)
//

const CURRENT_VERSION = "1.08";
// The address to the game, so we can post it in the Share dialog
const URL = "https://admiralspunky.github.io/venn/";
const genericLabels = ["Location", "Characteristic", "Spelling"]; //some zones get a customLabel instead
const INITIAL_HAND_SIZE = 5;
const MESSAGE_DISPLAY_TIME = 5000;
const TOTAL_WORDS_IN_POOL = 200;
const MIN_RULE_MATCHING_WORDS_PER_CATEGORY = 3;

let dailyMode = false;
let wordsInPlay = [];
let currentWordPool = [];
let currentHand = [];
let turns = 0;
let selectedWordId = null; // Used for click-to-place, will also be used for drag-and-drop
let isDarkMode = localStorage.getItem('theme') === 'dark';
let activeRules = [];
// User's selected lives, retrieved from localStorage or defaulting to 3
let userSetLives = parseInt(localStorage.getItem('userSetLives') || '3', 10);
// Current lives remaining in the game
let livesRemaining = 0; 
// Daily streak variables
let dailyStreak = parseInt(localStorage.getItem('dailyStreak') || '0', 10);
let lastDailyCompletionDate = localStorage.getItem('lastDailyCompletionDate') || '';
//after a word is played into a zone, that zone's words are less likely to be drawn
let zoneWeights = {};

// Define fallback rules to prevent undefined errors if rule candidates are empty
const fallbackLocationRule = { name: 'General Location', categoryType: 'location', words: [], test: () => false };
const fallbackCharacteristicRule = { name: 'General Characteristic', categoryType: 'characteristic', words: [], test: () => false };
const fallbackWordplayRule = { name: 'General Wordplay', categoryType: 'wordplay', words: [], test: () => false };


document.title = GAME_TITLE;

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
 * - `updateGameTitle()`: To update the display based on game mode.
 * - `updateDailyBadge()`: To show/hide the daily badge.
 * - `resetGameState()`: To clear previous game data.
 * - `generateCurrentWordPool()`: To create the initial set of available words.
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
    dailyMode = isDaily;

    // Use the daily seed for ALL randomization steps in daily mode
    const seed = isDaily ? getDailySeed() : Math.floor(Math.random() * 100000);
	
	//These are the probabilities that, when a new card is drawn, it will belong to a certain zone, and I divide these weights every time a card is played in that zone 
	//The initial three zones each start off with a card, so I'm reducing their weights before the start of the game, before the first hand is drawn
	//TODO: except the initial cards do not get re-drawn if they're below the zoneWeight, and they should
	zoneWeights = {
        '0': 1.0, 
        '1': 0.25,
        '2': 0.25,
        '3': 0.25,
        '1-2': 1.0,
        '1-3': 1.0,
        '2-3': 1.0,
        '1-2-3': 1.0
    };

    // Restore original rule generation logic
    activeRules = generateActiveRulesWithOverlap(seed, allPossibleRules);

    updateGameTitle(isDaily);
    updateDailyBadge(isDaily);
    resetGameState();

    // Use deterministic seed for the full word pool
    const initialFullWordPool = generateCurrentWordPool(seed + 1);
    console.log("Initial Full Word Pool:", initialFullWordPool);

    // Use deterministic seed for initial zone seeding
    seedInitialZones(initialFullWordPool);
    renderWordsInRegions();

    // Remove seeded (already placed) words from pool, deterministic shuffle for remaining pool
    currentWordPool = initialFullWordPool.filter(w => !wordsInPlay.some(obj => obj.text === w));
    shuffleArray(currentWordPool, seed + 2);

    const required = INITIAL_HAND_SIZE;
    if (currentWordPool.length < required) {
        showMessage("Critical Error: Not enough unique words for game. Please refresh.", true);
        return;
    }

    // Use deterministic seed for hand selection
    const weightedHand = generateWordPoolWithProbabilities(
        activeRules,
        currentWordPool,
        required,
        createSeededRandom(seed + 3)
    );
    console.log("Weighted Hand GENERATED:", weightedHand);

    if (weightedHand.length < required) {
        showMessage("Critical Error: Not enough unique words for game. Please refresh.", true);
        return;
    }

    // Remove words selected for the hand from the currentWordPool
    // This is the line added/corrected to prevent duplicates in hand
    currentWordPool = currentWordPool.filter(word => !weightedHand.includes(word));

    // Original loop for populating currentHand and wordsInPlay
    for (const wordText of weightedHand) {
        const wordObj = { id: crypto.randomUUID(), text: wordText, correctZoneKey: null };
        currentHand.push(wordObj);
        wordsInPlay.push(wordObj);
    }

    renderHand();

	showMessage("Select a card in Your Hand, then play it in one of the other 8 zones.");
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
 * other zones, it uses their `customLabel` or a `genericLabel`.
 *
 * 6.  **Clears Hints**: All `.rule-hint` elements across all game zones,
 * including the hand container, are cleared of text and hidden, ensuring
 * no hints remain from the active game.
 */
async function endGame(isWin) {
    const endButtonsContainer = document.getElementById('end-screen-buttons');

    // Handle daily streak logic
    if (dailyMode) {
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
            console.log("Daily puzzle failed. Streak reset to 0.");
        }
    }


    // ✅ Show message box
    const messageText = isWin
        ? `🎉 You Win! Game Over in ${turns} turns!`
        : `💀 Game Over! You ran out of guesses. Total turns: ${turns}`;
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
        console.log("share button clicked, dailyMode =", dailyMode);
 	    const dateLabel = dailyMode ? ` – ${getTodayDateString()}` : " (Random Game)";
        const gameLabel = GAME_TITLE + dateLabel;
        const winLossStatus = isWin ? "Won" : "Lost";
	    // Calculate incorrect guesses directly from lives (I'm assuming that these two variables actually represent their names)
        const incorrectGuessesMade = userSetLives - livesRemaining;
	    
        let fullShareText = `${gameLabel}: ${winLossStatus} in ${turns} turns, with ${incorrectGuessesMade} incorrect guesses!`;
        if (dailyMode && isWin) {
            fullShareText += ` ${dailyStreak} in a row!`;
        }
        fullShareText += ` Can you beat my score? ${URL}`;
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

    // ✅ Update rule box labels and clear hints
    const singleCategoryKeys = ['1', '2', '3'];
    for (const key in zoneConfigs) {
        const zoneConfig = zoneConfigs[key];
        const targetElement = zoneElements[key].container;

        if (targetElement) {
            const labelSpan = targetElement.querySelector('.box-label');
            const hintDiv = targetElement.querySelector('.rule-hint');

            if (labelSpan) {
                if (singleCategoryKeys.includes(key) && zoneConfig.genericLabelIndex !== null) {
                    labelSpan.textContent = activeRules[zoneConfig.genericLabelIndex].name;
                    labelSpan.style.fontSize = '0.8rem';
                } else {
                    labelSpan.textContent = zoneConfig.customLabel || genericLabels[zoneConfig.genericLabelIndex];
                    labelSpan.style.fontSize = '';
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


//This will assign .exampleHints to all rules
for (const rule of allPossibleRules) {
    if (!rule.exampleHints || !Array.isArray(rule.exampleHints)) {
        rule.exampleHints = generateExampleHintsFor(rule, allPossibleRules);
    }
}

function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

function getDailySeed() {
    const today = getTodayDateString().replace(/-/g, '');
    return parseInt(today, 10);
}

//utility function, because some rules have a test function, but most don't
function doesWordMatchRule(word, rule) {
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


// Utility to calculate a word's zone key based on which rules it matches
function getZoneKey(word, ruleResults) {
    let matchedZones = [];

    ruleResults.forEach((rule, index) => {
        if (doesWordMatchRule(word, rule)) {
            matchedZones.push(index + 1);
        }
    });

    return matchedZones.length ? matchedZones.join('-') : '0';
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
function generateWordPoolWithProbabilities(ruleResults, wordPool, count, rng) {
    const zoneProbabilities = {
        "1-2-3": 5,
        "1-2": 15,
        "1-3": 15,
        "2-3": 15,
        "1": 15,
        "2": 15,
        "3": 15,
        "0": 5
    };
    
    const zoneBuckets = {};
    
    // Group words by their zone key
    for (const word of wordPool) {
        const zoneKey = getZoneKey(word, ruleResults);
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
        const candidate = bucket.find(word => !used.has(word));
        
        if (candidate) {
            selected.push(candidate);
            used.add(candidate);
        } else {
            // Fallback: check all buckets for unused words
            const fallback = Object.values(zoneBuckets)
            .flat()
            .find(word => !used.has(word));
            
            if (!fallback) break; // No words left at all
            selected.push(fallback);
            used.add(fallback);
        }
    }
    // 🔍 Add this debug block here
    for (const word of selected) {
        console.log('generateWordPoolWithProbabilities ', word, '→', getZoneKey(word, ruleResults));
    }
    
    return selected;
}

console.log("Venn Diagram Game script loaded." + CURRENT_VERSION);

document.addEventListener("DOMContentLoaded", () => {
    // Safe DOM setup
    const versionEl = document.getElementById('version-display');
    const titleEl = document.getElementById('game-title-text');
	//I want to display the URL near the version number in the Settings menu, but I'm too lazy to make a whole new <div>
    //if (versionEl) versionEl.textContent = 'Version ' + CURRENT_VERSION;
    if (versionEl) versionEl.textContent = URL + ' v' + CURRENT_VERSION; 
	
	if (titleEl) titleEl.textContent = GAME_TITLE;
    
    // Safe theme setup, do we want to start in dark or light mode?
    applyTheme();

    // Initialize difficulty slider and display
    if (difficultySlider && livesDisplayModal) {
        userSetLives = parseInt(localStorage.getItem('userSetLives') || '3', 10);
        difficultySlider.value = userSetLives;
        livesDisplayModal.textContent = userSetLives;

        difficultySlider.addEventListener('input', (event) => {
            updateLivesSetting(parseInt(event.target.value, 10));
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

    if (lastPlayed !== today) {
        localStorage.setItem("lastDailyDate", today);
        console.log("Starting Daily Game for", today);
        startGame(true);
    } else {
        console.log("Starting regular game");
        startGame(false);
    }
});


const iconSVGs = {
    'location': `<svg class="rule-icon" fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
    'characteristic': `<svg class="rule-icon" fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568L23.725 9.17l-6.104 5.952 1.442 8.45L12 18.295l-7.063 3.794 1.442-8.45L.275 9.17l8.057-1.015L12 .587z"/></svg>`,
    'wordplay': `<svg class="rule-icon" fill="currentColor" width="18" height="18" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-1 7h5.5L13 3.5V9z"/></svg>`
};

const turnsDisplay = document.getElementById('turns-display');
// Get the lives display element on the main game screen
const livesDisplay = document.getElementById('lives-display'); 
const settingsBtn = document.getElementById('settings-btn'); // This is now just the settings opener
const messageBox = document.getElementById('message-box');
const handContainer = document.getElementById('hand-container');

const settingsModalOverlay = document.getElementById('settings-modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
//const newGameModalBtn = document.getElementById('new-game-modal-btn');
const darkModeToggleBtn = document.getElementById('dark-mode-toggle-btn'); // New dark mode toggle button
const aboutBtn = document.getElementById('about-btn');

// NEW: Get the difficulty slider and display elements inside the modal
const difficultySlider = document.getElementById('difficulty-slider');
const livesDisplayModal = document.getElementById('lives-display-modal');


const zoneElements = {
    '1': { container: document.getElementById('zone-1'), wordsDiv: document.getElementById('zone-1').querySelector('.word-cards-container') },
    '2': { container: document.getElementById('zone-2'), wordsDiv: document.getElementById('zone-2').querySelector('.word-cards-container') },
    '3': { container: document.getElementById('zone-3'), wordsDiv: document.getElementById('zone-3').querySelector('.word-cards-container') },
    '1-2': { container: document.getElementById('zone-1-2'), wordsDiv: document.getElementById('zone-1-2').querySelector('.word-cards-container') },
    '1-3': { container: document.getElementById('red-yellow-overlap-container'), wordsDiv: document.getElementById('red-yellow-overlap-container').querySelector('.word-cards-container') },
    '2-3': { container: document.getElementById('zone-2-3'), wordsDiv: document.getElementById('zone-2-3').querySelector('.word-cards-container') },
    '1-2-3': { container: document.getElementById('zone-1-2-3'), wordsDiv: document.getElementById('zone-1-2-3').querySelector('.word-cards-container') },
    '0': { container: document.getElementById('none-container'), wordsDiv: document.getElementById('none-container').querySelector('.word-cards-container') },
    'hand': { container: document.getElementById('hand-container'), wordsDiv: document.getElementById('hand-container').querySelector('.word-cards-container') }
};




const zoneConfigs = {
    '1': { id: 'zone-1', colorVar: '--zone1-bg', genericLabelIndex: 0, ruleIndices: [0], categoryTypes: ['location'] },
    '2': { id: 'zone-2', colorVar: '--zone2-bg', genericLabelIndex: 1, ruleIndices: [1], categoryTypes: ['characteristic'] },
    '3': { id: 'zone-3', colorVar: '--zone3-bg', genericLabelIndex: 2, ruleIndices: [2], categoryTypes: ['wordplay'] }, // Added ruleIndices: [2]
    '1-2': { id: 'zone-1-2', colorVar: '--zone12-bg', customLabel: 'Location & Characteristic', ruleIndices: [0, 1], categoryTypes: ['location', 'characteristic'] },
    '1-3': { id: 'red-yellow-overlap-container', colorVar: '--zone13-bg', customLabel: 'Location & Spelling', ruleIndices: [0, 2], categoryTypes: ['location', 'wordplay'] },
    '2-3': { id: 'zone-2-3', colorVar: '--zone23-bg', customLabel: 'Characteristic & Spelling', ruleIndices: [1, 2], categoryTypes: ['characteristic', 'wordplay'] },
    '1-2-3': { id: 'zone-1-2-3', colorVar: '--zone123-bg', customLabel: 'All Three', ruleIndices: [0, 1, 2], categoryTypes: ['location', 'characteristic', 'wordplay'] },
    '0': { id: 'none-container', colorVar: '--zone0-bg', customLabel: 'None of the above', ruleIndices: [], categoryTypes: [] }
};

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

function getBoxIconsSVG(categoryTypes) {
    let iconsHtml = '';
    categoryTypes.forEach(type => {
        iconsHtml += iconSVGs[type] || '';
    });
    return iconsHtml;
}

function matchesOnlyOneRule(wordText, targetRuleIndex) {
    let matchCount = 0;
    let matchedTargetRule = false;
    
    for (let i = 0; i < activeRules.length; i++) {
        const rule = activeRules[i];
        if (doesWordMatchRule(wordText, rule)) {
            matchCount++;
            if (i === targetRuleIndex) {
                matchedTargetRule = true;
            }
        }
    }
    
    return matchedTargetRule && matchCount === 1;
}

//each rule displays the names of 5 other rules in that category
function generateExampleHintsFor(rule, allRules ) {
    const count = 5;
	const sameCategory = allRules.filter(r =>
    r.categoryType === rule.categoryType
    );
    
    const shuffled = [...sameCategory].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(r => r.name);
}

function getCorrectZoneKeyForWord(word, rules) {
    let matchedZones = [];

    rules.forEach((rule, index) => {
        if (doesWordMatchRule(word, rule)) {
            matchedZones.push(index + 1);
        }
    });

    return matchedZones.length ? matchedZones.join('-') : '0';
}



function getZoneDisplayName(zoneKey, revealRules = false) {
    const zoneConfig = zoneConfigs[zoneKey];
    if (!zoneConfig) {
        console.error(`Attempted to get display name for unknown zoneKey: ${zoneKey}`);
        return "Unknown Category";
    }
    
    if (revealRules && ['1', '2', '3'].includes(zoneKey) && zoneConfig.genericLabelIndex !== null && activeRules[zoneConfig.genericLabelIndex]) {
        return activeRules[zoneConfig.genericLabelIndex].name;
    }
    
    if (zoneConfig.customLabel) {
        return zoneConfig.customLabel;
    }
    
    if (zoneConfig.genericLabelIndex !== null && genericLabels[zoneConfig.genericLabelIndex]) {
        return genericLabels[zoneConfig.genericLabelIndex];
    }
    
    return "General Category";
}

// =========================================
// getWeightedWordList()
// -----------------------------------------
// Called by: buildDeliberateWordPool()
// Calls: getZoneKey(word, rules), shuffleArray()
// 
// Purpose:
// Groups all words from the current active rules into buckets
// according to their zone (e.g., "1", "1-2", "1-2-3", or "0" for unmatched).
// Returns an object: { "1": [...], "2-3": [...], "0": [...] }
// =========================================
function getWeightedWordList(rules) {
    const allWords = new Set();
    // Collect all words from all rules
    for (const rule of rules) {
        if (Array.isArray(rule.words)) {
            rule.words.forEach(w => allWords.add(w));
        }
    }
    // Also add words that pass the test function but are not explicitly in words array
    // This is important for rules that primarily rely on a test function
    for (const rule of rules) {
        if (typeof rule.test === 'function') {
            // Iterate through a broader pool of words to find those matching the test
            // For this example, we'll assume a global 'allGameWords' or similar exists,
            // or we'll just use the words already collected.
            // A more robust solution might involve a larger, pre-defined dictionary.
            // For now, we'll only consider words already in 'allWords' or those explicitly
            // added to rule.words for test-based rules.
            // This part is tricky without a full word dictionary.
            // For demonstration, let's just ensure words in 'allWords' are tested.
            for (const word of allWords) {
                if (rule.test(word)) {
                    allWords.add(word); // Add if test passes, even if not in rule.words
                }
            }
        }
    }


    const zoneBuckets = {};

    // Classify each word into a zone
    for (const word of allWords) {
        const zoneKey = getZoneKey(word, rules);
        if (!zoneBuckets[zoneKey]) zoneBuckets[zoneKey] = [];
        zoneBuckets[zoneKey].push(word);

        if (zoneKey === "0") {
            console.log(`🟨 "${word}" is unmatched and placed in Zone 0`);
        }
    }

    // Log full zone distribution
    console.log("🔎 zoneBuckets (raw counts):");
    Object.entries(zoneBuckets).forEach(([key, val]) => {
        console.log(`  Zone ${key}: ${val.length} word(s)`);
    });

    return zoneBuckets;
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

// =========================================
// buildDeliberateWordPool()
// -----------------------------------------
// Called by: generateCurrentWordPool()
// Returns: an array of words with guaranteed zone coverage
// Ensures at least 1 Zone 0 word, even if all 3 rules are broad
// =========================================

function buildDeliberateWordPool(rules, seed) {
    const rng = mulberry32(seed || Date.now());

    const desiredCounts = {
        '1': 3,
        '2': 3,
        '3': 3,
        '1-2': 3,
        '1-3': 3,
        '2-3': 3,
        '1-2-3': 3,
        '0': 3,
    };

    // Get all words used by the current active rules
    const usedRuleWords = new Set();
    for (const rule of rules) {
        if (Array.isArray(rule.words)) {
            rule.words.forEach(w => usedRuleWords.add(w));
        }
    }

    // Get all words across all rules
    const allRuleWords = new Set();
    for (const rule of allPossibleRules) {
        if (Array.isArray(rule.words)) {
            rule.words.forEach(w => allRuleWords.add(w));
        }
    }

    // Words not used in current rules
    const neutralWords = [...allRuleWords].filter(w => !usedRuleWords.has(w));
    const allWords = [...usedRuleWords, ...neutralWords];

    const shuffledWords = allWords
        .map(word => ({ word, sortKey: rng() }))
        .sort((a, b) => a.sortKey - b.sortKey)
        .map(obj => obj.word);

    const zoneBuckets = {};
    const selected = [];

    for (const word of shuffledWords) {
        const zoneKey = getCorrectZoneKeyForWord(word, rules);

        if (!(zoneKey in desiredCounts)) continue;

        if (!zoneBuckets[zoneKey]) {
            zoneBuckets[zoneKey] = [];
        }

        if (zoneBuckets[zoneKey].length < desiredCounts[zoneKey]) {
            zoneBuckets[zoneKey].push(word);
            selected.push(word);
        }

        const allZonesFilled = Object.entries(desiredCounts).every(([zone, count]) =>
            (zoneBuckets[zone] || []).length >= count
        );
        if (allZonesFilled) break;
    }

    console.log("✅ buildDeliberateWordPool complete. Zone distribution:");
    for (const [zone, target] of Object.entries(desiredCounts)) {
        const actual = (zoneBuckets[zone] || []).length;
        console.log(`  Zone ${zone}: ${actual} / ${target}`);
    }

    return selected;
}


// =========================================
// generateCurrentWordPool()
// -----------------------------------------
// This is the top-level function that assembles the game's word pool.
// It delegates selection to buildDeliberateWordPool(), then tracks
// and logs the zone distribution for the selected words.
// =========================================
function generateCurrentWordPool(seed) {
    const pool = buildDeliberateWordPool(activeRules, seed);
    
    const zoneCount = {};
    pool.forEach(word => {
        const z = getZoneKey(word, activeRules);
        zoneCount[z] = (zoneCount[z] || 0) + 1;
    });
    console.log("✅ Final WordPool distribution:", zoneCount);
    
    return pool;
}

function showMessage(message, isError = false) {
    messageBox.innerHTML = message;
    messageBox.classList.remove("error");
    if (isError) {
        messageBox.classList.add("error");
    }
    messageBox.classList.add("visible");
    
    clearTimeout(messageBox.timeoutId);
    messageBox.timeoutId = setTimeout(() => {
        messageBox.classList.remove("visible");
    }, MESSAGE_DISPLAY_TIME);
}

function renderHand() {
    const handWordsDiv = zoneElements['hand'].wordsDiv;
    handWordsDiv.textContent = '';
    
    zoneElements['hand'].container.classList.remove("game-over-summary");
    
    currentHand.forEach(wordObj => {
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
    const playedWords = wordsInPlay.filter(wordObj => wordObj.correctZoneKey !== null);

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


function selectWord(id) {
    if (selectedWordId) {
        document.getElementById(`card-${selectedWordId}`)?.classList.remove("selected");
    }
    
    selectedWordId = id;
    document.getElementById(`card-${selectedWordId}`).classList.add("selected");
    showMessage(`Selected: ${wordsInPlay.find(w => w.id === id).text}. Now click a box to place it.`);
}

// Show a feedback bubble near a zone or element
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

function placeWordInRegion(targetZoneKeyString) {
    if (!selectedWordId) {
        showMessage('Please select a word first!', true);
        return;
    }

    if (targetZoneKeyString === 'hand') {
        showMessage('You cannot place words into your hand. Select a rule box or "None"!', true);
        return;
    }

    turns++;
    turnsDisplay.textContent = turns;

    const selectedWordObj = wordsInPlay.find(w => w.id === selectedWordId);
    const correctZoneKey = getCorrectZoneKeyForWord(selectedWordObj.text, activeRules);
    const correctZoneElement = zoneElements[correctZoneKey]?.container;
    const targetZoneElement = zoneElements[targetZoneKeyString]?.container;
	
	//regardless of correctness, the word was placed in the correctZoneKey, so make the correctZoneKey's cards less likely to be chosen again
	zoneWeights[correctZoneKey] /= 4; 
	console.log(` placement of ` + selectedWordObj.text + ' in zone ' + correctZoneKey + ', weight changed to ' + zoneWeights[correctZoneKey] );


    currentHand = currentHand.filter(w => w.id !== selectedWordId);
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
    console.log(`Target Zone Key (placed in): '${targetZoneKeyString}'`);
    // --- DEBUG LOGS END ---

    // This variable will hold the new card drawn from the pool
    // Initialize to null, it will only be assigned if a new card is to be drawn (on a miss)
    let newCardFromPool = null; 

    if (correctZoneKey === targetZoneKeyString) {
        // Perfect match: Hand size decreases, NO new card is drawn.
        isCorrectPlacement = true;
        selectedWordObj.correctZoneKey = correctZoneKey;
        message = `Correct! '${selectedWordObj.text}' belongs in this category.`;
        isErrorFeedback = false;
        console.log(`Outcome: Perfect Match`); // Debug log
        
        // Removed: newCardFromPool = drawCard();
        // Hand size will now decrease by 1 for perfect matches.
    } else {
        // Incorrect placement - now determine if it's a near miss or far miss
        const targetIsSingleZone = ['1', '2', '3'].includes(targetZoneKeyString);
        const correctZoneParts = correctZoneKey.split('-');
        const isTargetContainedInCorrectOverlap = correctZoneParts.includes(targetZoneKeyString);

        // --- DEBUG LOGS START ---
        console.log(`Target Is Single Zone (placed in): ${targetIsSingleZone}`);
        console.log(`Correct Zone Parts: [${correctZoneParts.join(', ')}]`);
        console.log(`Is Target Contained In Correct Overlap: ${isTargetContainedInCorrectOverlap}`);
        // --- DEBUG LOGS END ---

        if (targetIsSingleZone && correctZoneKey.includes('-') && isTargetContainedInCorrectOverlap) {
            // Near miss: Draw a new card, but no life lost.
            selectedWordObj.correctZoneKey = correctZoneKey; // Still mark with correct zone for visual placement
            newCardFromPool = drawCard(); // Draw a new card
            const correctCategoryName = getZoneDisplayName(correctZoneKey, false);
            message = `Near Miss! '${selectedWordObj.text}' belongs in "${correctCategoryName}". Draw a new card.`;
            isErrorFeedback = true; // Still show as a "mistake" visually
            console.log(`Outcome: Near Miss`); // Debug log
        } else {
            // Far miss: Lose a life and draw a new card.
            selectedWordObj.correctZoneKey = correctZoneKey; // Still mark with correct zone for visual placement
            livesRemaining--; // Lose a life
            updateLivesDisplay();
            newCardFromPool = drawCard(); // Draw a new card

            const correctCategoryName = getZoneDisplayName(correctZoneKey, false);
            message = `Oops! '${selectedWordObj.text}' belongs in "${correctCategoryName}". Draw a new card.`;
            if (currentWordPool.length <= 3) {
                message += `   Only ${currentWordPool.length} card${currentWordPool.length === 1 ? '' : 's'} left!`;
            }
            message += ` Lives left: ${livesRemaining}.`;
            isErrorFeedback = true; // Definitely an error
            console.log(`Outcome: Far Miss`); // Debug log
        }
    }

    // This block now only executes if newCardFromPool was assigned (meaning a miss occurred)
    if (newCardFromPool) {
        // If drawCard() successfully returned a word (i.e., deck is not empty)
        const newWordObj = { id: crypto.randomUUID(), text: newCardFromPool, correctZoneKey: null };
        currentHand.push(newWordObj);
        wordsInPlay.push(newWordObj); // Add to wordsInPlay so it can be tracked
        console.log(`New card '${newWordObj.text}' added to hand.`);
    } else if (!isCorrectPlacement) {
        // This condition handles the case where it was a miss, but drawCard() returned null (deck empty)
        console.log("No new card drawn for a miss because currentWordPool is empty.");
        message += " (No more cards to draw!)"; // Inform the player
    }


    // Show feedback bubble (currently disabled by you)
    // showZoneFeedback(message, targetZoneElement, isErrorFeedback);

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
}

//I'm replacing the old drawCard function; this new function checks the zoneWeight before it actually draws the card
function drawCard() {
    // Loop until a card is successfully drawn or the deck is empty
    while (currentWordPool.length > 0) {
        let cardToConsider = currentWordPool[0]; // Get the top card
        const cardZoneKey = getCorrectZoneKeyForWord(cardToConsider, activeRules);

        // Get the weight for this card's zone
        const zoneWeight = zoneWeights[cardZoneKey] !== undefined ? zoneWeights[cardZoneKey] : 1.0;

        // Calculate the probability of *not* drawing this card (moving it to bottom)
        const chanceToMoveToBottom = 1 - zoneWeight;

        // Generate a random number between 0 and 1
        const randomNumber = Math.random();

        console.log(`Considering drawing '${cardToConsider}'. Zone: '${cardZoneKey}', Weight: ${zoneWeight.toFixed(2)}, Chance to move to bottom: ${chanceToMoveToBottom.toFixed(2)}, Random: ${randomNumber.toFixed(2)}`);

        if (randomNumber < chanceToMoveToBottom) {
            // If the random number suggests moving to bottom, do so
            const movedCard = currentWordPool.shift(); // Remove from top
            currentWordPool.push(movedCard);          // Add to bottom
            console.log(`'${movedCard}' moved to bottom of deck due to zone weight.`);
            // The loop will continue to the next iteration to consider the new top card
        } else {
            // If the random number suggests drawing, draw the card and exit the loop
            const drawnCard = currentWordPool.shift(); // Remove from top and return
            console.log(`'${drawnCard}' drawn.`);
			
            return drawnCard; // A card was drawn, exit the function
        }
    }

    // If the loop finishes, it means currentWordPool.length was 0
    console.log("Deck is empty. Cannot draw more cards.");
    return null; // Or handle game end/shuffle
}

/*
function drawCard() {
    if (currentWordPool.length > 0) {
		//console.log("currentWordPool before pop:", [...currentWordPool]); // Log a copy before pop
        const newWordText = currentWordPool.pop();
		//console.log("Word drawn:", newWordText); // Log the word being drawn
        const newWordObj = { id: crypto.randomUUID(), text: newWordText, correctZoneKey: null };
        currentHand.push(newWordObj);
        wordsInPlay.push(newWordObj);
    } else {
        showMessage('No more cards to draw from the pool! Try to clear your hand.', true);
    }
}
*/

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
        showMessage('Failed to copy results. Please try again or copy manually.', true);
    }
    document.body.removeChild(textarea);
}

// NEW: Function to check for win or loss
async function checkGameEndCondition() { 
    if (currentHand.length === 0) {
        // Win condition (all cards placed correctly)
        endGame(true);
    } else if (livesRemaining <= 0) { // Loss condition: lives run out
        endGame(false);
    }
}



function updateGameTitle(isDaily) {
    const titleTextElement = document.getElementById("game-title-text");

    if (titleTextElement) {
        let fullTitleString;

        if (isDaily) {
            fullTitleString = `${GAME_TITLE} - ${getTodayDateString()}`;
        } else {
            fullTitleString = GAME_TITLE;
        }

        // --- Start of the secure line break insertion logic ---

        // Clear any existing content within the title element
        // This is important if updateGameTitle can be called multiple times
        titleTextElement.textContent = ''; // Safely clear all child nodes

        // Split the full title string into parts where you want line breaks
        const parts = fullTitleString.split(' - ');

        parts.forEach((part, index) => {
            // Create a text node for each part of the title
            const textNode = document.createTextNode(part.trim()); // .trim() to clean up whitespace

            // Append the text node to the title element
            titleTextElement.appendChild(textNode);

            // Add a <br> tag after each part except the very last one
            if (index < parts.length - 1) {
                const brElement = document.createElement('br');
                titleTextElement.appendChild(brElement);
            }
        });

        // --- End of the secure line break insertion logic ---
    }
}

function updateDailyBadge(isDaily) {
    const badge = document.getElementById("daily-badge");
    if (badge) {
        badge.style.display = isDaily ? 'inline-block' : 'none';
    }
}

function resetGameState() {
	document.querySelectorAll('.word-cards-container').forEach(container => { container.replaceChildren(); });
    turns = 0;
    selectedWordId = null;
    turnsDisplay.textContent = turns;
    // Initialize lives and update display using userSetLives
    livesRemaining = userSetLives; 
    updateLivesDisplay(); 
    messageBox.classList.remove("visible");
    messageBox.style.height = '';
    messageBox.style.minHeight = '';
    messageBox.style.textAlign = '';
    hideModal();
    updateRuleBoxLabelsAndHints();
    wordsInPlay = [];
    currentHand = [];
    renderWordsInRegions();
}

// Function to update the lives display on the main game screen
function updateLivesDisplay() { 
    if (livesDisplay) {
        livesDisplay.textContent = livesRemaining;
    }
}

// Function to update the lives setting and save to local storage
function updateLivesSetting(value) {
    userSetLives = value;
    livesDisplayModal.textContent = userSetLives;
    localStorage.setItem('userSetLives', userSetLives);
}


function seedInitialZones(pool) {
    const initialZoneKeys = ['1', '2', '3'];
    const wordsPlaced = new Set();
    for (let i = 0; i < initialZoneKeys.length; i++) {
        const targetZoneKey = initialZoneKeys[i];
        const targetRuleIndex = parseInt(targetZoneKey) - 1;
        const candidates = pool.filter(w => !wordsPlaced.has(w));
        const shuffled = shuffleArray([...candidates], 20 + i);
        let chosenWord = shuffled.find(word => matchesOnlyOneRule(word, targetRuleIndex))
            || shuffled.find(word => activeRules[targetRuleIndex].test(chosenWord));

        if (chosenWord) {
            wordsPlaced.add(chosenWord);
            wordsInPlay.push({
                id: crypto.randomUUID(),
                text: chosenWord,
                correctZoneKey: targetZoneKey,
                isInitialSeed: true // Mark as initially seeded for rendering logic
			});
			zoneWeights[targetZoneKey] /= 4; // If a word gets placed in a zone, make it half as likely to be chosen again
			console.log(`Initial placement of ` + chosenWord + ' in zone ' + targetZoneKey + ', weight changed to ' + zoneWeights[targetZoneKey] );
        } else {
            console.warn(`[startGame] Could not find word for Rule ${targetZoneKey} (${activeRules[targetRuleIndex]?.name || 'N/A'})`);
        }
        console.log(`rule ${i + 1} : ${activeRules[i]?.name}`);
    }
}


function generateActiveRules(gameSeed) {
    const locationCandidates = shuffleArray([...allPossibleRules.filter(rule => rule.categoryType === 'location')], gameSeed + 1);
    const characteristicCandidates = shuffleArray([...allPossibleRules.filter(rule => rule.categoryType === 'characteristic')], gameSeed + 2);
    const wordplayCandidates = shuffleArray([...allPossibleRules.filter(rule => rule.categoryType === 'wordplay')], gameSeed + 3);
    
	return [
	  locationCandidates.length > 0 ? locationCandidates[0] : fallbackLocationRule,
	  characteristicCandidates.length > 0 ? characteristicCandidates[0] : fallbackCharacteristicRule,
	  wordplayCandidates.length > 0 ? wordplayCandidates[0] : fallbackWordplayRule
	];
}

// =========================================
// generateActiveRulesWithOverlap()
// -----------------------------------------
// Called by: startGame()
// Returns: an array of 3 rules [location, characteristic, wordplay]
// Ensures sufficient pairwise and triple overlaps before accepting
// =========================================
function generateActiveRulesWithOverlap(seed, allRules, minSharedWords = 3, minTripleOverlap = 1, maxAttempts = 1000) {
    const locationRules = allRules.filter(r => r.categoryType === 'location');
    const characteristicRules = allRules.filter(r => r.categoryType === 'characteristic');
    const wordplayRules = allRules.filter(r => r.categoryType === 'wordplay');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const loc = shuffleArray([...locationRules], seed + attempt * 3 + 1)[0];
        const chr = shuffleArray([...characteristicRules], seed + attempt * 3 + 2)[0];
        const wrd = shuffleArray([...wordplayRules], seed + attempt * 3 + 3)[0];

        const candidateSet = [loc, chr, wrd];
        const zoneBuckets = getWeightedWordList(candidateSet);

        const sharedZones = ['1-2', '1-3', '2-3', '1-2-3'];
        const totalSharedCount = sharedZones.reduce((sum, zone) => sum + (zoneBuckets[zone]?.length || 0), 0);
        const tripleOverlapCount = zoneBuckets['1-2-3']?.length || 0;

        if (tripleOverlapCount >= minTripleOverlap && totalSharedCount >= minSharedWords) {
            console.log(`✅ Found overlapping rules on attempt ${attempt + 1}`);

            // Debug: print zone distribution
            const zoneKeys = ["0", "1", "2", "3", "1-2", "1-3", "2-3", "1-2-3"];
            console.log("🔎 Potential word distribution for selected rules (pre-weighted):");
            for (const key of zoneKeys) {
                const count = zoneBuckets[key]?.length || 0;
                console.log(`  Zone ${key}: ${count} word(s)`);
            }

            return candidateSet;
        }
    }

    console.warn("⚠️ No sufficiently overlapping rule trio found after max attempts. Falling back.");
    return generateActiveRules(seed); // fallback to simpler selection
}



function updateRuleBoxLabelsAndHints(isGameOver = false) {
    for (const key in zoneConfigs) {
        const zoneConfig = zoneConfigs[key];
        const targetElement = zoneElements[key].container;
        
        if (targetElement) {
            let labelSpan = targetElement.querySelector('.box-label');
            let hintDiv = targetElement.querySelector('.rule-hint');
            let iconsContainer = targetElement.querySelector('.box-icons-container');
            
            if (labelSpan) {
                labelSpan.textContent = getZoneDisplayName(key, isGameOver);
                if (isGameOver && ['1', '2', '3'].includes(key)) {
                    labelSpan.style.fontSize = '0.8rem';
                } else {
                    labelSpan.style.fontSize = '';
                }
            }
            
            if (hintDiv) {
                let hintText = '';
                if (!isGameOver) {
                    // --- DEBUG LOG START ---
                    console.log('Debug in updateRuleBoxLabelsAndHints: key=', key, 'zoneConfig=', zoneConfig, 'zoneConfig.ruleIndices=', zoneConfig.ruleIndices);
                    // --- DEBUG LOG END ---
                    const numRulesMatched = zoneConfig.ruleIndices.length; 
                    
                    if (numRulesMatched === 1) {
                        let relevantCategoryType = zoneConfig.categoryTypes[0];
                        let candidateHints = [];
                        let currentActiveRuleName = activeRules[zoneConfig.ruleIndices[0]].name;
                        
                        allPossibleRules.forEach(rule => {
                            if (rule.categoryType === relevantCategoryType && rule.name !== currentActiveRuleName) {
                                candidateHints.push(rule.name);
                            }
                        });
                        
                        const uniqueHints = Array.from(new Set(shuffleArray(candidateHints, Date.now() + key.length))).slice(0, 5);
                        hintText = uniqueHints.length > 0 ? "Some example rules of this type:\n\n" + uniqueHints.join('\n') : 'No other rules of this type available.';
                    } else if (numRulesMatched === 2) {
                        hintText = "Words in this category meet exactly 2 rules.";
                    } else if (numRulesMatched === 3) {
                        hintText = "Words in this category meet all three rules.";
                    } else if (key === '0') {
                        hintText = 'Words that do not fit any of the rules provided.';
                    }
                }
                hintDiv.textContent = hintText;
                if (isGameOver) {
                    hintDiv.classList.remove("visible");
                }
            }
            
            if (iconsContainer && zoneConfig.categoryTypes) {
                iconsContainer.innerHTML = getBoxIconsSVG(zoneConfig.categoryTypes);
            }
            
            if (targetElement && !targetElement.hasAttribute('data-hint-listeners-added')) {
                targetElement.addEventListener('mouseover', () => { if (!isGameOver) hintDiv.classList.add("visible"); });
                targetElement.addEventListener('mouseout', () => { if (!isGameOver) hintDiv.classList.remove("visible"); });
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
    }

    applyThemeToggleIcon(); // Update the icon after applying theme
}


// New function to update the moon/sun icon in the modal
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

// Event listener for the new dark mode toggle button inside the modal
if (darkModeToggleBtn) {
    darkModeToggleBtn.addEventListener('click', toggleDarkMode);
}

settingsModalOverlay.addEventListener('click', (event) => {
    if (event.target === settingsModalOverlay) {
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
