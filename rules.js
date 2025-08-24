//2025-08-20 - I previously use rules from three different categories: location, Characteristic, and Wordplay; but I've decided to switch to using three Spelling clues instead.

const allPossibleRules = [
 
  // === spelling Rules ===
  {
    name: 'Has a consecutive double letter',
    test: (word) => {
      const lowerWord = word.toLowerCase();
      for (let i = 0; i < lowerWord.length - 1; i++) {
        if (lowerWord[i] === lowerWord[i + 1]) {
          return true;
        }
      }
      return false;
    }
  },
  {
    name: 'Starts and ends with the same letter',
    words: ['level', 'noon', 'madam', 'redder', 'refer', 'stats', 'civic', 'racecar', 'deified', 'rotator', 'sagas', 'pup', 'pop', 'tot', 'peep', 'pip', 'gig', 'bob'],
    test: (word) => {
      const w = word.toLowerCase();
      return w[0] === w[w.length - 1];
    }
  },
  {
    name: 'Has 3 letters',
    words: [],
    test: (word) => word.length === 3
  },
  {
    name: 'Has 4 letters',
    words: ['book', 'noon', 'kook', 'hall', 'pool', 'bike', 'lamp', 'jump', 'taxi'],
    test: (word) => word.length === 4
  },
  {
    name: 'Has 5 letters',
    words: ['apple', 'table', 'chair', 'plane', 'grape', 'crane', 'stone', 'bread', 'flute', 'blink', 'knife'],
    test: (word) => word.length === 5
  },
  {
    name: 'First letter is repeated within the word',
    words: ['alabama', 'banana', 'papaya', 'kook', 'sassafras', 'pepper', 'mimic', 'gag', 'level', 'civic', 'refer', 'deeded', 'tattoo'],
    test: (word) => {
      const w = word.toLowerCase();
      const first = w[0];
      return w.slice(1).includes(first);
    }
  },
  {
    name: 'Has 2 or more repeated letters',
    words: ['letter', 'bubble', 'pepper', 'cabbage', 'committee', 'banana', 'apple', 'balloon', 'address', 'success'],
    test: (word) => {
      const w = word.toLowerCase();
      const counts = {};
      for (const c of w) {
        counts[c] = (counts[c] || 0) + 1;
      }
      let repeated = 0;
      for (const k in counts) {
        if (counts[k] > 1) repeated++;
        if (repeated >= 2) return true;
      }
      return false;
    }
  },
  {
    name: 'Begins with a vowel',
    words: ['apple', 'orange', 'igloo', 'umbrella', 'elephant', 'ostrich', 'island', 'apricot', 'ear', 'eye'],
    test: (word) => /^[aeiou]/i.test(word)
  },
  {
    name: 'Ends with a vowel',
    words: ['banana', 'potato', 'tomato', 'zebra', 'pizza', 'mango', 'avocado', 'kiwi', 'radio', 'auto', 'happy', 'mystery', 'tyranny', 'weary','blurry','teary','bleary','symphony','robbery'],
    test: (word) => /[aeiou]$/i.test(word)
  },
  {
    name: 'Contains exactly 1 vowel',
    words: [
      // These are words that should trigger the regex, but they include both a consonant 'y' and a single vowel, so they wouldn't get picked up by the regex
      'yak','yes','yet','yin','yon',
    ], // MUST be defined as an array
	  // words like 'study' should NOT trigger this rule, but I don't want to code an exclusion list, so I'm always counting 'y' as a vowel for this rule
    test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 1;
    }
  },
	  {
    name: 'Contains exactly 2 vowels',
    words: [

    ], // MUST be defined as an array
    test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 2;
    }
  },
  {
    name: 'Contains exactly 3 vowels',
    words: [
      // These are words that should trigger the regex, but some of those vowels are 'y', so they wouldn't get picked up by the regex
      'bleary', 'cynical', 'dynamic', 'lyrical', 'mythical', 'mystery',
      'syllable', 'symphony', 'typical', 'tyranny', 'teary', 'weary'
    ], // MUST be defined as an array
    test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 3;
    }
  },
  {
    name: 'Contains no repeated letters',
    categoryType: 'spelling',
    words: ['cat', 'dog', 'lamp', 'brick', 'house', 'plant', 'jump', 'quick', 'fox', 'zebra', 'light', 'grape'],
    test: (word) => {
      const seen = new Set();
      for (const char of word.toLowerCase()) {
        if (seen.has(char)) return false;
        seen.add(char);
      }
      return true;
    }
  },
  {
    name: 'Contains the letter "j"',
    words: ['jump','jaguar','projector','injection'],
    test: (word) => /j/i.test(word)
  },
  {
    name: 'Contains the letter "x"',
    words: ['fox', 'box', 'axe', 'taxi', 'extra', 'exit', 'fix', 'mix', 'flex'],
    test: (word) => /x/i.test(word)
  },
  {
    //defines a function named test that takes a word as input and returns true if the word contains the letter "z" (case-insensitive), and false otherwise.
    name: 'Contains the letter "z"',
    words: ['zoo', 'pizza', 'zebra'],
    test: (word) => /z/i.test(word)
  },
	{
	  name: 'Contains 4 or fewer unique letters',
	  words: ['zoo', 'pizza','street','glass'],
	  test: (word) => {
	    const w = word.toLowerCase();
	    const uniques = new Set(); // Use a Set to store unique characters
	    for (const c of w) {
	      uniques.add(c); // Sets automatically handle uniqueness
	    }
	    return uniques.size <= 4; // Check the size of the Set
	  }	
	}];	


