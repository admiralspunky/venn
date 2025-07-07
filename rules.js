const allPossibleRules = [
  // === Location Rules ===
  {
    name: 'You expect to find it in an office',
    categoryType: 'location',
    words: [
      'computer', 'pen', 'paper', 'stapler', 'printer', 'desk', 'folder', 'calendar',
      'mouse', 'keyboard', 'chair', 'mug', 'lamp', 'phone', 'whiteboard', 'projector',
      'clipboard', 'calculator', 'scanner', 'notebook', 'monitor', 'envelope', 'briefcase',
      'badge', 'highlighter', 'book', 'clock', 'ruler', 'glue', 'scissors'
    ],
  },
  {
    name: 'Can be found in a kitchen',
    categoryType: 'location',
    words: ['fork', 'spoon', 'knife', 'plate', 'cup', 'bowl', 'pan', 'pot', 'oven', 'stove', 'refrigerator', 'microwave', 'sink', 'dish', 'mug', 'blender', 'toaster', 'kettle', 'cutting', 'spatula', 'colander', 'grater', 'peeler'],
  },
  {
    name: 'You would find it outside',
    categoryType: 'location',
    words: ['tree', 'flower', 'cloud', 'mountain', 'river', 'rock', 'grass', 'sun', 'moon', 'star', 'bird', 'squirrel', 'bench', 'path', 'fence', 'gate', 'bush', 'pond', 'sky', 'dirt', 'squirrel', 'apple',
      'snake', 'bee', 'tree', 'bird', 'rock'],
  },
  {
    name: 'You expect to find it at a school',
    categoryType: 'location',
    words: [
	  "backpack", "notebook", "binder", "chalk", "desk", "locker", "cafeteria",
	  "classroom", "hallway", "pencil", "pen", "eraser", "whiteboard", "blackboard",
	  "ruler", "protractor", "globe", "textbook", "projector", "microscope",
	  "worksheet", "assignment", "teacher", "principal", "student", "recess",
	  "exam", "test", "quiz", "schedule", "bus", "gym", "auditorium", "lab",
	  "detention", "bell", "uniform", "grade", "report", "chalkboard", "highlighter",
	  "paperclip", "stapler", "homework", "semester", "notepad", "lunchbox",
	  "classmate", "education", "study", "lecture", "syllabus", "library", "dictionary"
	]
  },
  {
	name: 'You expect to find it in a hospital',
	categoryType: 'location',
	words: [
		  "bed", "nurse", "doctor", "patient", "gown", "mask", "gloves", "syringe",
		  "scalpel", "stethoscope", "bandage", "wheelchair", "gurney", "monitor",
		  "clipboard", "chart", "prescription", "vitals", "injection", "anesthesia",
		  "surgeon", "scan", "thermometer", "hospital", "scrubs",
		  "ambulance", "pill", "medication", "capsule", "antibiotic", "vaccine",
		  "operation", "emergency", "intensive", "recovery", "radiology",
		  "lobby", "receptionist", "appointment", "diagnosis", "discharge", "blood",
		  "plasma", "oxygen", "defibrillator", "surgery"
		]
	},
	{
	  name: 'You expect to find it in a store',
	  categoryType: 'location',
	  words: ["shelf", "cart", "bag", "receipt", "aisle", "counter", "barcode", "pricetag", "cashier", "sign", "display", "product", "clothing", "food", "grocery", "produce", "box", "basket", "scale", "coupon", "sale", "door", "window", "advertisement", "customer", "employee", "manager", "cleaner", "floor", "ceiling", "lighting", "cash", "scanner", "stockroom", "inventory", "locker", "stall", "trolley", "lanes"]

	},

	{
	  name: 'You expect to find it at an airport',
	  categoryType: 'location',
	  words: [
		  'plane', 'airplane', 'luggage', 'ticket', 'passport', 'terminal', 'runway', 'gate','boarding', 'security', 'baggage', 'arrival', 'departure', 'flight','pilot', 'steward', 'customs','engine', 'alarm', 'announcement', 'siren', 'bell', 'beep', 'scanner', 'bag'
		]
	},
	{
	  name: 'You expect to find it in a bathroom',
	  categoryType: 'location',
	  words: ["toilet", "sink", "shower", "bathtub", "mirror", "towel", "soap", "brush", "razor", "comb", "toothbrush", "toothpaste", "shampoo", "conditioner", "faucet", "drain", "mat", "curtain", "lotion", "scale", "floss", "deodorant", "candle", "plunger"]

	},
	{
	  name: 'You expect to find it in a bedroom',
	  categoryType: 'location',
	  words: [
		  "bed", "pillow", "blanket", "sheet", "dresser", "mirror", "nightstand", "lamp",
		  "clock", "alarm", "rug", "closet", "hanger", "sock", "underwear", "pajamas",
		  "window", "curtain", "drawer", "bookshelf", "journal", "slippers", "headboard",
		  "mattress", "duvet", "comforter", "poster", "photo", "frame", "television",
		  "remote", "charger", "phone", "stuffed animal", "diary", "laundry", "hamper",
		  "clothes", "shoes", "desk", "chair", "fan", "ceiling"]
	},
	{
	  name: 'You expect to find it in a garage',
	  categoryType: 'location',
	  words: [
		  'car', 'jack', 'wrench', 'toolbox', 'bucket', 'tire', 'ladder', 'broom', 'rake',
		  'bike', 'scooter', 'helmet', 'rope', 'hose', 'can', 'tool', 'drill', 'saw',
		  'vacuum', 'box', 'bench', 'shelf', 'oil', 'rags', 'funnel', 'gloves', 'paint',
		  'chainsaw', 'hammer', 'pliers', 'screwdriver', 'garage', 'door', 'motor', 'engine',
		  'belt', 'brake', 'gasoline', 'filter', 'battery', 'air compressor', 'grease',
		  'wheel', 'lightbulb', 'radio', 'tape', 'measuring tape',
		  'workbench', 'vise', 'spray paint', 'scraper', 'fan', 'light', 'canister', 'nails',
		  'bolts', 'nuts', 'sander', 'mask', 'goggles', 'earmuffs'
		],
	},
  // === Characteristic Rules ===
  {
    name: 'Often makes a sound',
    categoryType: 'characteristic',
    words: [
		'bell', 'whistle', 'drum', 'piano', 'clock', 'phone', 'car', 'dog', 'thunder',
		'siren', 'speaker', 'radio', 'alarm', 'cat', 'guitar', 'train', 'microphone',
		'television', 'baby', 'wind', 'doorbell', 'engine', 'screaming',
		'beep', 'buzz', 'clang', 'ding', 'buzzer', 'horn', 'chime'
] },
  {
    name: 'Is a type of animal',
    categoryType: 'characteristic',
    words: [
		  'cat', 'dog', 'bear', 'lion', 'tiger', 'wolf', 'fox', 'bat', 'rat', 'cow',
		  'pig', 'deer', 'horse', 'goat', 'sheep', 'zebra', 'giraffe', 'monkey', 'ape',
		  'otter', 'whale', 'dolphin', 'shark', 'eel', 'octopus', 'crab', 'lobster', 'clam',
		  'snail', 'slug', 'bee', 'ant', 'wasp', 'moth', 'fly', 'gnat', 'termite', 'beetle',
		  'lizard', 'gecko', 'snake', 'python', 'cobra', 'frog', 'toad', 'newt', 'salamander',
		  'chicken', 'duck', 'goose', 'swan', 'penguin', 'turkey', 'rooster', 'falcon',
		  'hawk', 'eagle', 'owl', 'parrot', 'canary', 'finch', 'sparrow', 'pigeon',
		  'fish', 'trout', 'bass', 'salmon', 'carp', 'anchovy', 'shad', 'guppy', 'minnow',
		  'buffalo', 'bison', 'donkey', 'mule', 'camel', 'alpaca', 'llama', 'kangaroo',
		  'koala', 'platypus', 'panther', 'leopard', 'jaguar', 'lynx', 'cheetah',
		  'moose', 'elk', 'reindeer', 'ibex', 'yak', 'ox', 'weasel', 'ferret', 'skunk',
		  'raccoon', 'badger', 'porcupine', 'hedgehog', 'armadillo', 'beaver', 'capybara',
		  'walrus', 'seal', 'narwhal', 'flamingo', 'heron', 'crane', 'robin', 'peacock'
		]
  },
  {
    name: 'Is a type of fruit',
    categoryType: 'characteristic',
    words: [
	  'apple', 'apricot', 'avocado', 'banana', 'blackberry', 'blueberry', 'boysenberry',
	  'cantaloupe', 'cherry', 'coconut', 'cranberry', 'currant', 'date', 'dragonfruit',
	  'durian', 'elderberry', 'fig', 'gooseberry', 'grape', 'grapefruit', 'guava',
	  'honeydew', 'jackfruit', 'kiwi', 'kumquat', 'lemon', 'lime', 'lychee', 'mango',
	  'mulberry', 'nectarine', 'olive', 'orange', 'papaya', 'passionfruit', 'peach',
	  'pear', 'persimmon', 'pineapple', 'plum', 'pomegranate', 'quince', 'raisin',
	  'raspberry', 'rhubarb', 'starfruit', 'strawberry', 'tangerine', 'tomato', 'watermelon'
	]
},
  {
    name: 'Mostly man-made',
    categoryType: 'characteristic',
    words: [
  'car', 'building', 'phone', 'computer', 'chair', 'table', 'road', 'bridge', 'light',
  'bottle', 'cup', 'book', 'watch', 'robot', 'tool', 'machine', 'brick', 'cement',
  'microwave', 'remote', 'stapler', 'ladder', 'vacuum', 'rope'
  'airplane', 'ticket', 'passport', 'terminal', 'runway', 'scanner', 'gate', 'alarm',
  'announcement', 'security', 'luggage', 'boarding', 'receipt',
  'clock', 'projector', 'keyboard', 'mouse', 'notebook', 'whiteboard', 'clipboard',
  'calculator', 'envelope', 'printer', 'scanner', 'monitor', 'suitcase', 'badge',
  'cashier', 'register', 'credit', 'label', 'barcode', 'shelf', 'basket', 'bag',
  'container', 'helmet', 'net', 'glove', 'backpack', 'tray', 'remote', 'engine',
  'speaker', 'radio', 'lamp', 'trolley', 'x-ray', 'control', 'turnstile'
] },
  {
    name: 'Dangerous',
    categoryType: 'characteristic',
    words: [
	  'shark', 'lion', 'tiger', 'bear', 'wolf', 'snake', 'scorpion', 'alligator', 'crocodile',
	  'spider', 'wasp', 'hornet', 'panther', 'jaguar', 'piranha', 'mosquito', 'hyena',
	  'avalanche', 'earthquake', 'volcano', 'tornado', 'hurricane', 'lightning',
	  'explosion', 'bomb', 'grenade', 'missile', 'rifle', 'gun', 'knife', 'sword', 'dagger',
	  'landmine', 'trap', 'fire', 'poison', 'radiation', 'acid', 'toxin', 'flood', 'blizzard',
	  'fall', 'electrocution', 'disease', 'infection', 'cancer', 'asbestos',
	  'drowning', 'prison', 'war', 'battlefield', 'riot', 'murder', 'attack', 'ambush',
	  'hostage', 'terror', 'sniper', 'heist', 'robbery', 'choke', 'strangle', 'stab',
	  'shoot', 'fight', 'punch', 'kick', 'bite'
	]},
  {
    name: 'Worth more than $100',
    categoryType: 'characteristic',
    words: ['car', 'house', 'jewelry', 'computer', 'phone', 'television', 'guitar', 'piano', 'motorcycle', 'watch', 'bike', 'camera', 'laptop', 'furniture', 'art', 'boat', 'diamond'],
  },
  {
    name: 'Single-use',
    categoryType: 'characteristic',
    words: ['napkin', 'tissue', 'disposable', 'cup', 'paper', 'plate', 'cotton', 'swab', 'match', 'firecracker', 'balloon', 'bandage', 'ticket', 'receipt', 'sticker', 'wrapper', 'straw', 'glove'],
  },
  {
    name: 'Shiny or reflective',
    categoryType: 'characteristic',
    words: ['mirror', 'diamond', 'gold', 'silver', 'glass', 'water', 'metal', 'chrome', 'lightbulb', 'jewelry', 'coin', 'window', 'lake', 'ice', 'snow', 'dew', 'raindrop', 'lamp', 'monitor', 'sink', 'sun', 'moon', 'star', 'river', 'pond', 'sky', 'scanner', 'faucet', 'television', 'car', 'light'],
  },

	{
	  name: 'Has a point or spike',
	  categoryType: 'characteristic',
	  words: [
		'knife', 'needle', 'thorn', 'pin', 'pencil', 'nail', 'screw', 'star', 'mountain', 'tooth', 'horn', 'arrow', 'spear', 'branch', 'icicle', 'cactus', 'rose', 'shark',
		'fang', 'claw', 'sting', 'bee', 'scorpion', 'pinecone', 'leaf', 'spike', 'twig', 'sword', 'dagger', 'razor', 'scalpel', 'blade', 'dart', 'awl', 'pineapple',
		'icepick', 'pickaxe', 'hook', 'peg', 'spur'
	  ],
	},

 {
    name: 'Flammable',
    categoryType: 'characteristic',
    words: ['paper', 'wood', 'gas', 'oil', 'candle', 'match', 'alcohol', 'fabric', 'cotton', 'plastic', 'coal', 'firewood', 'lighter', 'tinder', 'fuel', 'straw', 'leaves', 'grass', 'bush', 'gasoline', 'paint', 'flower', 'cardboard', 'kerosene', 'lighter fluid', 'aerosol', 'propane', 'solvent'],
  },
  {
    name: 'You can look through it',
    categoryType: 'characteristic',
    words: [
    "window", "glass", "telescope", "microscope", "binoculars", "periscope", "magnifying glass",
    "goggles", "lens", "eyeglasses", "sunglasses", "door", "peephole", "skylight",
    "aquarium", "pinhole", "camera", "scope", "visor", "windshield",  "screen",
    "cellophane", "plastic", "ice", "jar", "beaker", "crystal", "bubble","water"
  ]
  },
  {
    name: 'Most people have touched it',
    categoryType: 'characteristic',
    words: ['money', 'door', 'phone', 'keyboard', 'pen', 'paper', 'book', 'fabric', 'skin', 'water', 'food', 'glass', 'wood', 'metal', 'plastic', 'coin', 'shoes', 'handle', 'button', 'screen', 'table', 'chair'],
  },
  {
    name: 'Expected to last 100 years',
    categoryType: 'characteristic',
    words: ['mountain', 'river', 'rock', 'building', 'tree', 'diamond', 'gold', 'pyramid', 'statue', 'fortress', 'lighthouse', 'bridge', 'planet', 'star', 'ocean', 'cathedral', 'tomb'],
  },
  {
    name: 'Pre-dates the USA (1776)',
    categoryType: 'characteristic',
    words: ['pyramid', 'castle', 'sword', 'chariot', 'scroll', 'papyrus', 'rome', 'greece', 'egypt', 'bow', 'arrow', 'wheel', 'fire', 'cave', 'mammoth', 'dinosaur', 'moon', 'sun', 'star', 'tree', 'river', 'mountain'],
  },
  {
    name: 'wilderness survival',
    categoryType: 'characteristic',
    words: ["knife", "fire", "water", "shelter", "rope", "compass", "map", "signal", "stick", "berry", "plant", "trap", "axe", "flint", "tent", "path", "track", "gear", "food", "clothing", "blade", "bow", "arrow", "cave", "camp", "stone"]

  },
  {
    name: 'Subject of myth or legend',
    categoryType: 'characteristic',
    words: [
	  "phoenix", "centaur", "cyclops", "minotaur", "chimera", "hydra", "pegasus", "medusa", "griffin",
	  "goblin", "troll", "fairy", "djinn", "mermaid", "nymph", "dryad", "yeti", "kraken",
	  "giant", "golem", "witch", "wizard", "druid", "sorcerer", "sphinx", "oracle", "prophet",
	  "temple", "labyrinth", "mountain", "forest", "island", "chalice", "relic", "amulet",
	  "thunderbolt", "lightning", "mirror", "cauldron", "sword", "dagger", "staff", "cloak",
	  "dragon", "serpent", "wolf", "raven", "stag", "horse", "beast", "hero", "villain",
	  "curse", "spell", "riddle", "fire", "ice", "shadow", "spirit", "ghost", "demon", "angel",
	  "heaven", "underworld", "hell", "afterlife", "fate", "destiny", "eternity", "rebirth"
	],
  },
	 {
	  name: "Can be carried",
	  categoryType: "characteristic",
	  words: ["bag", "box", "radio", "baby", "knife", "bottle", "sword", "backpack", "helmet", "goggles", "mirror", "alarm", "pillow", "torch", "bucket", "hat", "broom", "plate", "mask", "towel", "rope", "bookbag", "phone", "key", "wallet", "pen", "tablet", "notebook", "flashlight", "camera", "thermos", "scarf", "snack", "dice", "lantern", "toy", "umbrella", "shovel", "candle", "calculator", "ball", "brick", "booklet", "cassette", "doll", "leash", "paintbrush"]
	},

  {
    name: 'Can be worn',
    categoryType: 'characteristic',
    words: [
		'hat', 'gloves', 'scarf', 'jacket', 'eyeglasses', 'sunglasses', 'watch', 'belt', 'shoes', 'socks', 'tie',
		'shirt', 'pants', 'dress', 'coat', 'boots', 'necklace', 'ring', 'earrings', 'bracelet', 'glasses',
		'cap', 'hoodie', 'shorts', 'sweater', 'vest', 'mittens', 'sandals', 'helmet', 'uniform', 'pajamas',
		'cufflinks', 'crown', 'mask'
	  ],
  },
  {
    name: 'Used in sports',
    categoryType: 'characteristic',
      words: [
		  'ball', 'bat', 'racket', 'glove', 'helmet', 'jersey', 'whistle', 'net', 'puck', 'skates',
		  'shoe', 'cleat', 'goal', 'goalpost', 'court', 'field', 'track', 'bike', 'bike helmet',
		  'trophy', 'referee', 'coach', 'stadium', 'bench', 'water bottle', 'sneaker', 'pad', 'guard',
		  'mask', 'bike lock', 'timer', 'scoreboard', 'whistle', 'flag', 'gym', 'locker', 'goalie',
		  'rope', 'jump rope', 'chalk', 'mat', 'belt', 'ring', 'rope', 'climb', 'coach whistle'
		]

  },
  // === Wordplay Rules ===
  {
    name: 'Has a consecutive double letter',
    categoryType: 'wordplay',
    words: ['apple', 'coffee', 'book', 'balloon', 'committee', 'common', 'mirror', 'sweet', 'see', 'spell', 'street', 'door', 'hall', 'pool', 'pepper', 'bubble', 'spoon', 'letter', 'runner', 'pillow', 'shampoo'],
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
    categoryType: 'wordplay',
    words: ['level', 'noon', 'madam', 'redder', 'refer', 'stats', 'civic', 'racecar', 'deified', 'rotator', 'sagas', 'pup', 'pop', 'tot', 'peep', 'pip', 'gig', 'bob'],
    test: (word) => {
      const w = word.toLowerCase();
      return w[0] === w[w.length - 1];
    }
  },
  {
    name: 'Has 5 letters',
    categoryType: 'wordplay',
    words: ['apple', 'table', 'chair', 'plane', 'grape', 'crane', 'stone', 'bread', 'flute', 'blink', 'knife'],
    test: (word) => word.length === 5
  },
  {
    name: 'First letter is repeated within the word',
    categoryType: 'wordplay',
    words: ['alabama', 'banana', 'papaya', 'kook', 'sassafras', 'pepper', 'mimic', 'gag', 'level', 'civic', 'refer', 'deeded', 'tattoo'],
    test: (word) => {
      const w = word.toLowerCase();
      const first = w[0];
      return w.slice(1).includes(first);
    }
  },

  {
    name: 'Has 2 or more repeated letters',
    categoryType: 'wordplay',
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
    name: "Has one syllable",
    categoryType: "wordplay",

    words: [
      'cat', 'dog', 'bird', 'fish', 'frog', 'rock', 'truck', 'grass', 'jump', 'cloud', 'desk', 'milk', 'glove', 'sink', 'knife', 'brick', 'chair', 'chalk',
      'plant', 'brush', 'watch', 'skunk', 'peach', 'street', 'lamp', 'glass', 'crisp', 'blush', 'snack', 'flash', 'drill'
    ]
  },
  {
	  name: 'Begins with a vowel',
	  categoryType: 'wordplay',
	   words: ['word1', 'word2'],  // MUST be defined as an array
	  test: (word) => /^[aeiou]/i.test(word)
	},
  {
	  name: 'Ends with a vowel',
	  categoryType: 'wordplay',
	   words: ['word1', 'word2'],  // MUST be defined as an array
	  test: (word) => /[aeiou]$/i.test(word)
	},

	{
	  name: 'Contains exactly 3 vowels',
	  categoryType: 'wordplay',
	   words: ['word1', 'word2'],  // MUST be defined as an array
	  test: (word) => {
		const vowels = word.match(/[aeiou]/gi);

		return vowels && vowels.length === 3;
	  }
	},

	{
	  name: 'Contains no repeated letters',
	  categoryType: 'wordplay',
	   words: ['word1', 'word2'],  // MUST be defined as an array
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
	  name: 'Contains the letter "x"',
	  categoryType: 'wordplay',
	   words: ['word1', 'word2'],  // MUST be defined as an array
	  test: (word) => /x/i.test(word)
	}

];
