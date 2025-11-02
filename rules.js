// last updated: 2025-10-12

//2025-08-20 - I previously used rules from three different categories: location, Characteristic, and Wordplay; but I've decided to switch to using three Spelling clues instead.

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
	  test: (word) => {
      const w = word.toLowerCase();
      return w[0] === w[w.length - 1];
    }
  },
  {
    name: 'Has fewer than 7 letters',
    test: (word) => word.length < 7
  },
  {
    name: 'Has at least 7 letters',
    test: (word) => word.length >= 7
  },
  {
    name: 'First letter is repeated within the word',
    test: (word) => {
      const w = word.toLowerCase();
      const first = w[0];
      return w.slice(1).includes(first);
    }
  },
  {
    name: 'Has 2 or more repeated letters',
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
    name: 'Begins with a consonant',
    test: (word) => /^[^aeiou]/i.test(word)
  },
  {
    name: 'Ends with a consonant',
    test: (word) => /[^aeiou]$/i.test(word)
  },
  {
    name: 'Begins with a vowel',
    test: (word) => /^[aeiou]/i.test(word)
  },
  {
    name: 'Ends with a vowel',
    test: (word) => /[aeiou]$/i.test(word)
  },
  {
    name: 'Contains exactly 1 vowel',
    test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 1;
    }
  },
	  {
    name: 'Contains exactly 2 vowels',
   test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 2;
    }
  },
  {
    name: 'Contains exactly 3 vowels',
   test: (word) => {
      const vowels = word.match(/[aeiou]/gi);
      return vowels && vowels.length === 3;
    }
  },
  {
    name: 'Contains no repeated letters',
    test: (word) => {
      const seen = new Set();
      for (const char of word.toLowerCase()) {
        if (seen.has(char)) return false;
        seen.add(char);
      }
      return true;
    }
  },
/* this rule appears a little too frequently for now	
    {
    name: 'Contains the letter "p"',
    test: (word) => /p/i.test(word)
  },
*/
{
  name: 'Contains a Rare Letter (j, q, x, or z)',
  test: (word) => /j|q|x|z/i.test(word)
},
	{
	  name: 'Contains 4 or fewer unique letters',
	  test: (word) => {
	    const w = word.toLowerCase();
	    const uniques = new Set(); // Use a Set to store unique characters
	    for (const c of w) {
	      uniques.add(c); // Sets automatically handle uniqueness
	    }
	    return uniques.size <= 4; // Check the size of the Set
	  }	
	},
/* vowel 2nd, 3rd, or 4th are all pretty annoying to spot, and those rules come up too frequently, and crowd out the more interesting rules
 {
  name: 'Has a vowel as the second letter',
  test: (word) => {
    const vowels = 'aeiou';
    const lowerWord = word.toLowerCase();
    return lowerWord.length >= 2 && vowels.includes(lowerWord[1]);
  }
 },	
 {
  name: 'Has a vowel as the third letter',
  test: (word) => {
    const vowels = 'aeiou';
    const lowerWord = word.toLowerCase();
    return lowerWord.length >= 3 && vowels.includes(lowerWord[2]);
  }
 },	
  {
  name: 'Has a vowel as the fourth letter',
  test: (word) => {
    const vowels = 'aeiou';
    const lowerWord = word.toLowerCase();
    return lowerWord.length >= 4 && vowels.includes(lowerWord[3]);
    }
  },
*/
];	








