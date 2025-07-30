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
    words: [
      'fork', 'spoon', 'knife', 'plate', 'cup', 'bowl', 'pan', 'pot', 'oven', 'stove',
      'refrigerator', 'microwave', 'sink', 'dish', 'mug', 'blender', 'toaster', 'kettle',
      'spatula', 'colander', 'grater', 'peeler', 'whisk', 'apron', 'ladle', 'tongs',
      'strainer', 'can opener', 'cutting board', 'cookie sheet', 'corkscrew', 'mortar',
      'pestle', 'grill', 'mixer', 'sieve', 'rolling pin', 'oven mitt', 'timer',
      'measuring cup', 'scale', 'dish rack'
    ],
  },
  {
    name: 'You would find it outside',
    categoryType: 'location',
    words: [
      'tree', 'flower', 'cloud', 'mountain', 'river', 'rock', 'grass', 'sun', 'moon', 'star', 'bird', 'squirrel', 'bench', 'path', 'fence', 'gate', 'bush', 'pond', 'sky', 'dirt', 
      'snake', 'bee', 'tree', 'bird', 'rock', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'bat', 'rat', 'cow',
      'pig', 'deer', 'horse', 'goat', 'sheep', 'zebra', 'giraffe', 'monkey', 'ape',
      'otter', 'whale', 'dolphin', 'shark', 'eel', 'octopus', 'crab', 'lobster', 'clam',
      'snail', 'slug', 'bee', 'ant', 'wasp', 'moth', 'fly', 'gnat', 'termite', 'beetle',
      'lizard', 'gecko', 'snake', 'python', 'cobra', 'frog', 'toad', 'newt', 'salamander',
      'chicken', 'duck', 'goose', 'swan', 'penguin', 'turkey', 'rooster', 'falcon',
      'hawk', 'eagle', 'owl', 'parrot', 'canary', 'finch', 'sparrow', 'pigeon','dog','cat',
      'fish', 'trout', 'bass', 'salmon', 'carp', 'anchovy', 'shad', 'guppy', 'minnow',
      'buffalo', 'bison', 'donkey', 'mule', 'camel', 'alpaca', 'llama', 'kangaroo',
      'koala', 'platypus', 'panther', 'leopard', 'jaguar', 'lynx', 'cheetah','chimpanzee',
      'moose', 'elk', 'reindeer', 'ibex', 'yak', 'ox', 'weasel', 'ferret', 'skunk',
      'raccoon', 'badger', 'porcupine', 'hedgehog', 'armadillo', 'beaver', 'capybara',
      'walrus', 'seal', 'narwhal', 'flamingo', 'heron', 'crane', 'robin', 'peacock',
	'tangerine','quince','apple',
      "phoenix", "centaur", "cyclops", "minotaur", "chimera", "hydra", "pegasus", "medusa", "griffin",
      "goblin", "troll", "fairy", "djinn", "mermaid", "nymph", "dryad", "yeti", "kraken","giant","sphinx",
      
    ],
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
    words: [
      "shelf", "cart", "bag", "receipt", "aisle", "counter", "barcode", "pricetag", "cashier", "sign", "display", "product", "clothing", "food", "grocery", "produce", "box", "basket", "scale",
      "coupon", "sale", "door", "window", "advertisement", "customer", "employee", "manager", "cleaner", "floor", "ceiling", "lighting", "cash", "scanner", "stockroom", "inventory", "locker",
      "stall", "trolley", "lanes"
    ]
  },
  {
    name: 'You expect to find it at an airport',
    categoryType: 'location',
    words: [
      'plane', 'airplane', 'luggage', 'ticket', 'passport', 'terminal', 'runway', 'gate', 'boarding', 'security', 'baggage', 'arrival', 'departure', 'flight', 'pilot', 'steward', 'customs',
      'engine', 'alarm', 'announcement', 'siren', 'bell', 'beep', 'scanner', 'bag'
    ]
  },
  {
    name: 'You expect to find it in a bathroom',
    categoryType: 'location',
    words: [
      "toilet", "sink", "shower", "bathtub", "mirror", "towel", "soap", "brush", "razor", "comb", "toothbrush", "toothpaste", "shampoo", "conditioner",
      "faucet", "drain", "mat", "curtain", "lotion", "scale", "floss", "deodorant", "candle", "plunger"
    ]
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
      "clothes", "shoes", "desk", "chair", "fan", "ceiling"
    ]
  },
  {
    name: 'You expect to find it in a garage',
    categoryType: 'location',
    words: [
      'car', 'jack', 'wrench', 'toolbox', 'bucket', 'tire', 'ladder', 'broom', 'rake',
      'bike', 'scooter', 'helmet', 'rope', 'hose', 'can', 'tool', 'drill', 'saw',
      'vacuum', 'box', 'bench', 'shelf', 'oil', 'rags', 'funnel', 'gloves', 'paint',
      'chainsaw', 'hammer', 'pliers', 'screwdriver','door', 'motor', 'engine',
      'belt', 'brake', 'gasoline', 'filter', 'battery', 'air compressor', 'grease',
      'wheel', 'lightbulb', 'radio', 'tape', 'measuring tape',
      'workbench', 'vise', 'spray paint', 'scraper', 'fan', 'light', 'canister', 'nail',
      'bolt', 'nut', 'sander', 'mask', 'goggles', 'earmuffs',
    ],
  },
{
    name: 'You expect to find it in a library',
    categoryType: 'location',
    words: [
        // Core items
        'book', 'shelf', 'desk', 'chair', 'table', 'computer', 'printer', 'scanner',
        'librarian', 'patron', 'card catalog', 'magazine', 'newspaper', 'DVD', 'CD',
        'microfilm', 'map', 'atlas', 'dictionary', 'encyclopedia', 'thesaurus',

        // Services & Areas
        'reading room', 'study carrel', 'reference section', 'children\'s section',
        'meeting room', 'restroom', 'water fountain', 'exit', 'entrance', 'information desk',
        'checkout counter', 'return bin', 'sign', 'poster', 'display case', 'bulletin board',
        'copy machine', 'shredder', 'wi-fi', 'power outlet', 'charging station', 'door',

        // Tools & Supplies
        'pen', 'pencil', 'paper', 'stapler', 'hole punch', 'clipboard', 'notepad',
        'lamp', 'clock', 'calendar', 'whiteboard', 'projector', 'screen',
        'cart', 'ladder', 'globe', 'magnifying glass', 'bookmark',

        // Technology & Accessories (beyond basic computer)
        'headphone', 'microphone', 'webcam', 'tablet', 'laptop', 'e-reader',

        // Less common but still plausible
        'art display', 'sculpture', 'plant', 'coffee machine' // (in some modern libraries)
    ],
},

//
// === Characteristic Rules ===
//
	
  {
    name: 'Often makes a sound',
    categoryType: 'characteristic',
    words: [
      'bell', 'whistle', 'drum', 'piano', 'clock', 'phone', 'car', 'cat', 'dog', 'thunder',
      'siren', 'speaker', 'radio', 'alarm', 'cat', 'guitar', 'train', 'microphone',
      'television', 'baby', 'wind', 'doorbell', 'engine', 'screaming',
      'buzzer', 'horn', 'chime'
    ]
  },
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
      'walrus', 'seal', 'narwhal', 'flamingo', 'heron', 'crane', 'robin', 'peacock', 'zebra',
      'chimpanzee'
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
      'car', 'building', 'phone', 'computer', 'chair', 'table', 'road', 'bridge',
      'bottle', 'cup', 'book', 'watch', 'robot', 'tool', 'machine', 'brick', 'cement',
      'microwave', 'remote', 'stapler', 'ladder', 'vacuum', 'rope', 'chainsaw',
      'airplane', 'ticket', 'passport', 'terminal', 'runway', 'scanner', 'gate', 'alarm',
      'announcement','luggage', 'boarding', 'receipt', 'screwdriver','shoes',
      'clock', 'projector', 'keyboard', 'mouse', 'notebook', 'whiteboard', 'clipboard',
      'calculator', 'envelope', 'printer', 'scanner', 'monitor', 'suitcase', 'badge',
      'cashier', 'register', 'credit', 'label', 'barcode', 'shelf', 'basket', 'bag',
      'container', 'helmet', 'net', 'glove', 'backpack', 'tray', 'remote', 'engine',
      'speaker', 'radio', 'lamp', 'trolley', 'x-ray', 'control', 'turnstile', 'scooter',
      'glue', 'highlighter', 'lightbulb', 'capsule', 'photo', 'pizza','mesh','door','goalpost',
	'ambulance','lens','mat','stethoscope','wheel','air compressor','slippers','nightstand','laundry','fan',
	'diary','ceiling','pillow'
    ]
  },
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
    ]
  },
  {
    name: 'Usually worth more than $100',
    categoryType: 'characteristic',
    words: ['car', 'house', 'jewelry', 'computer', 'phone', 'television', 'guitar', 'piano', 'motorcycle', 'watch', 'bike', 'camera', 'laptop', 'furniture', 'art', 'boat', 'diamond',
	    'printer','monitor','projector','scanner','refrigerator','oven','stove','engine','motor','chainsaw','robot'],
  },
  {
    name: 'Single-use',
    categoryType: 'characteristic',
    words: ['napkin', 'tissue', 'disposable', 'cup', 'paper', 'plate', 'cotton', 'swab', 'match', 'firecracker', 'balloon', 'bandage', 'ticket', 'receipt', 'sticker', 'wrapper', 'straw', 'glove'],
  },
  {
    name: 'Shiny or reflective',
    categoryType: 'characteristic',
    words: [
      'mirror', 'diamond', 'gold', 'silver', 'glass', 'water', 'metal', 'chrome', 'lightbulb', 'jewelry', 'coin', 'window', 'lake', 'ice', 'snow', 'dew', 'raindrop',
      'lamp', 'monitor', 'sink', 'sun', 'moon', 'star', 'river', 'pond', 'television', 'light'
    ],
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
    words: ['paper', 'wood', 'gas', 'oil', 'candle', 'match', 'alcohol', 'fabric', 'cotton', 'plastic', 'coal', 'firewood', 'lighter', 'tinder', 'fuel', 'straw', 'leaves', 
	    'grass', 'bush', 'gasoline', 'paint', 'flower', 'cardboard', 'kerosene', 'lighter fluid', 'aerosol', 'propane', 'solvent'],
  },
  {
    name: 'You can look through it',
    categoryType: 'characteristic',
    words: [
      "window", "glass", "telescope", "microscope", "binoculars", "periscope", "magnifying glass",
      "goggles", "lens", "eyeglasses", "sunglasses", "door", "peephole", "skylight",
      "aquarium", "pinhole", "camera", "scope", "visor", "windshield", "screen",
      "cellophane", "plastic", "ice", "jar", "beaker", "crystal", "bubble", "water"
    ]
  },
  {
    name: 'Most people have touched it',
    categoryType: 'characteristic',
    words: ['money', 'door', 'phone', 'keyboard', 'pen', 'paper', 'book', 'fabric', 'skin', 'water', 'food', 'glass', 'wood', 'metal', 'plastic', 'coin', 'window', 'shoes', 'handle', 'button', 'screen', 'table', 'chair'],
  },
  {
    name: 'Expected to last 100 years',
    categoryType: 'characteristic',
    words: ['mountain', 'river', 'rock', 'building', 'tree', 'diamond', 'gold', 'pyramid', 'statue', 'fortress', 'lighthouse', 'bridge', 'planet', 'star', 'ocean', 'cathedral', 'tomb'],
  },
  {
    name: 'Pre-dates the USA (1776)',
    categoryType: 'characteristic',
    words: [
      'pyramid', 'castle', 'sword', 'chariot', 'scroll', 'papyrus', 'rome', 'greece', 'egypt', 'bow', 'arrow', 'wheel',
      'fire', 'cave', 'mammoth', 'dinosaur', 'moon', 'sun', 'star', 'tree', 'river', 'mountain', 'water', 'glass', 'apple'
    ],
  },
  {
    name: 'would help you survive in the wilderness',
    categoryType: 'characteristic',
    words: [
      "knife", "fire", "water", "shelter", "rope", "compass", "map", "signal", "stick", "berry", "plant", "trap", "axe", "flint", "tent", "path",
      "track", "gear", "food", "clothing", "blade", "bow", "arrow", "cave", "camp", "stone", 'belt'
    ]
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
    words: [
      "bag", "box", "radio", "baby", "knife", "bottle", "sword", "backpack", "helmet", "goggles", "mirror", "alarm", "pillow", "torch", "bucket", "hat",
      "broom", "plate", "mask", "towel", "rope", "bookbag", "phone", "key", "wallet", "pen", "tablet", "notebook", "flashlight", "camera", "thermos", "scarf",
      "snack", "dice", "lantern", "toy", "umbrella", "shovel", "candle", "calculator", "ball", "brick", "booklet", "cassette", "doll", "leash", "paintbrush",
      "comb", "brush", "staff", 'helmet','pencil','boots','ruler','mug','can opener','rolling pin'
    ]
  },
  {
    name: 'Contains holes',
    categoryType: 'characteristic',
    words: [
      'donut', 'swiss cheese', 'sieve', 'colander', 'net', 'strainer', 'button', 'belt',
      'bagel', 'hoop', 'ring', 'pipe', 'straw', 'flute', 'whistle', 'mask', 'goggles',
      'door', 'grater', 'spiderweb', 'fence', 'lace', 'mesh', 'corkscrew', 'key', 'lock',
      'fishing net', 'golf ball', 'vent', 'drain', 'sleeve', 'sock', 'glove', 'earring', 'chain',
      'tire', 'wheel', 'perforated paper', 'pegboard', 'honeycomb', 'colander', 'strainer'
    ],
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
      'rope', 'jump rope', 'chalk', 'mat', 'belt', 'ring', 'rope', 'climb'
    ]
  },
  {
    name: 'is an adjective',
    categoryType: 'characteristic',
    words: [
      'lazy', 'crazy', 'hazy', 'dizzy', 'fuzzy', 'zany', 'zealous', 'bizarre', 'frozen', 'amazing',
      'red', 'orange', 'yellow', 'green', 'indigo', 'violet', 'white', 'black', 'brown', 'gray',
      'big', 'small', 'large', 'huge', 'tiny', 'many', 'few', 'much', 'little', 'most',
      'happy', 'sad', 'angry', 'excited', 'calm', 'joyful', 'tired', 'brave', 'kind', 'friendly',
      'sweet', 'sour', 'salty', 'bitter', 'spicy', 'zesty', 'fresh', 'stale', 'aromatic',
      'funny', 'pretty', 'tall', 'wrong', 'honest', 'calm', 'dumb', 'tough', 'high', 'light', 'whole', 'entire',
    ]
  },
  {
    name: "Has one syllable",
    categoryType: "characteristic",
    words: [
      'cat', 'dog', 'bird', 'fish', 'frog', 'rock', 'truck', 'grass', 'jump', 'cloud', 'desk', 'milk', 'glove', 'sink', 'knife', 'brick', 'chair', 'chalk',
      'plant', 'brush', 'watch', 'skunk', 'peach', 'street', 'lamp', 'glass', 'crisp', 'blush', 'snack', 'flash', 'drill', 'book', 'hall', 'noon', 'stats',
      'pup', 'tot', 'pop', 'peep', 'pip', 'gig','break','red','tape','tool'
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
    name: 'Has 4 letters',
    categoryType: 'wordplay',
    words: ['book', 'noon', 'kook', 'hall', 'pool', 'bike', 'lamp', 'jump', 'taxi'],
    test: (word) => word.length === 4
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
    name: 'Begins with a vowel',
    categoryType: 'wordplay',
    words: ['apple', 'orange', 'igloo', 'umbrella', 'elephant', 'ostrich', 'island', 'apricot', 'ear', 'eye'],
    test: (word) => /^[aeiou]/i.test(word)
  },
  {
    name: 'Ends with a vowel',
    categoryType: 'wordplay',
    words: ['banana', 'potato', 'tomato', 'zebra', 'pizza', 'mango', 'avocado', 'kiwi', 'radio', 'auto', 'happy', 'mystery', 'tyranny', 'weary','blurry','teary','bleary','symphony'],
    test: (word) => /[aeiou]$/i.test(word)
  },
  {
    name: 'Contains exactly 3 vowels',
    categoryType: 'wordplay',
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
    categoryType: 'wordplay',
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
    categoryType: 'wordplay',
    words: ['jump','jaguar','projector','injection'],
    test: (word) => /x/i.test(word)
  },
  {
    name: 'Contains the letter "x"',
    categoryType: 'wordplay',
    words: ['fox', 'box', 'axe', 'taxi', 'extra', 'exit', 'fix', 'mix', 'flex'],
    test: (word) => /x/i.test(word)
  },
  {
    //defines a function named test that takes a word as input and returns true if the word contains the letter "z" (case-insensitive), and false otherwise.
    name: 'Contains the letter "z"',
    categoryType: 'wordplay',
    words: ['zoo', 'pizza', 'zebra'],
    test: (word) => /z/i.test(word)
  },
	{
	  name: 'Contains 4 or fewer unique letters',
	  categoryType: 'wordplay',
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
