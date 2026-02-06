// Cosmetic items configuration

export const AVATARS = {
  default: { emoji: '😊', name: 'Default', color: 'bg-slate-200', animated: false },
  star: { emoji: '⭐', name: 'Star', color: 'bg-yellow-200', animated: true },
  fire: { emoji: '🔥', name: 'Fire', color: 'bg-orange-200', animated: true },
  lightning: { emoji: '⚡', name: 'Lightning', color: 'bg-yellow-300', animated: true },
  crown: { emoji: '👑', name: 'Crown', color: 'bg-yellow-400', animated: false },
  gem: { emoji: '💎', name: 'Gem', color: 'bg-blue-300', animated: true },
  rocket: { emoji: '🚀', name: 'Rocket', color: 'bg-purple-300', animated: true, price: 150 },
  rainbow: { emoji: '🌈', name: 'Rainbow', color: 'bg-pink-200', animated: true, price: 200 },
  alien: { emoji: '👾', name: 'Alien', color: 'bg-green-300', animated: true, price: 175 },
  wizard: { emoji: '🧙', name: 'Wizard', color: 'bg-indigo-300', animated: false, price: 100 },
};

export const BADGES = {
  bronze: { emoji: '🥉', name: 'Bronze', color: 'text-amber-700' },
  silver: { emoji: '🥈', name: 'Silver', color: 'text-slate-400' },
  gold: { emoji: '🥇', name: 'Gold', color: 'text-yellow-500' },
  platinum: { emoji: '⚪', name: 'Platinum', color: 'text-slate-300' },
};

export const FRAMES = {
  default: { name: 'Default', border: 'border-2 border-slate-300', shadow: '' },
  bronze: { name: 'Bronze', border: 'border-4 border-amber-600', shadow: 'shadow-lg shadow-amber-600/30' },
  silver: { name: 'Silver', border: 'border-4 border-slate-400', shadow: 'shadow-lg shadow-slate-400/30' },
  gold: { name: 'Gold', border: 'border-4 border-yellow-500', shadow: 'shadow-lg shadow-yellow-500/40' },
};

export const THEMES = {
  default: {
    name: 'Default',
    gradient: 'from-purple-100 via-blue-100 to-pink-100',
    primaryColor: 'purple',
  },
  ocean: {
    name: 'Ocean',
    gradient: 'from-cyan-100 via-blue-200 to-teal-100',
    primaryColor: 'cyan',
    price: 150,
  },
  sunset: {
    name: 'Sunset',
    gradient: 'from-orange-100 via-pink-200 to-purple-100',
    primaryColor: 'orange',
    price: 150,
  },
  neon: {
    name: 'Neon',
    gradient: 'from-pink-200 via-purple-300 to-blue-200',
    primaryColor: 'pink',
    price: 200,
  },
  galaxy: {
    name: 'Galaxy',
    gradient: 'from-indigo-200 via-purple-300 to-pink-200',
    primaryColor: 'indigo',
    price: 200,
  },
  forest: {
    name: 'Forest',
    gradient: 'from-green-100 via-emerald-200 to-teal-100',
    primaryColor: 'green',
    price: 175,
  },
};

export const SOUND_PACKS = {
  default: { 
    name: 'Classic', 
    description: 'Original game sounds', 
    icon: '🎵',
    sounds: {
      buttonPress: { frequency: 400, duration: 100 },
      correct: { frequencies: [523, 659, 784], duration: 200 },
      wrong: { frequency: 200, duration: 300 },
      gameStart: { frequencies: [262, 330, 392, 523], duration: 150 },
      gameEnd: { frequencies: [523, 392, 330, 262], duration: 200 },
    }
  },
  retro: { 
    name: 'Retro', 
    description: '8-bit arcade sounds', 
    icon: '🕹️', 
    price: 100,
    sounds: {
      buttonPress: { frequency: 800, duration: 50 },
      correct: { frequencies: [1047, 1319, 1568], duration: 100 },
      wrong: { frequency: 100, duration: 150 },
      gameStart: { frequencies: [523, 659, 784, 1047], duration: 100 },
      gameEnd: { frequencies: [1047, 784, 659, 523], duration: 150 },
    }
  },
  nature: { 
    name: 'Nature', 
    description: 'Calm nature sounds', 
    icon: '🌿', 
    price: 125,
    sounds: {
      buttonPress: { frequency: 600, duration: 120, type: 'sine' },
      correct: { frequencies: [440, 554, 659], duration: 250, type: 'sine' },
      wrong: { frequency: 180, duration: 400, type: 'sine' },
      gameStart: { frequencies: [294, 370, 440, 554], duration: 200, type: 'sine' },
      gameEnd: { frequencies: [554, 440, 370, 294], duration: 250, type: 'sine' },
    }
  },
  space: { 
    name: 'Space', 
    description: 'Futuristic space sounds', 
    icon: '🚀', 
    price: 150,
    sounds: {
      buttonPress: { frequency: 1200, duration: 80 },
      correct: { frequencies: [1568, 1976, 2349], duration: 150 },
      wrong: { frequency: 80, duration: 250 },
      gameStart: { frequencies: [784, 988, 1175, 1568], duration: 120 },
      gameEnd: { frequencies: [1568, 1175, 988, 784], duration: 180 },
    }
  },
  drums: { 
    name: 'Drums', 
    description: 'Percussion sounds', 
    icon: '🥁', 
    price: 100,
    sounds: {
      buttonPress: { frequency: 150, duration: 50 },
      correct: { frequencies: [200, 250, 300], duration: 100 },
      wrong: { frequency: 80, duration: 200 },
      gameStart: { frequencies: [150, 200, 250, 300], duration: 80 },
      gameEnd: { frequencies: [300, 250, 200, 150], duration: 120 },
    }
  },
};

export const CURSORS = {
  default: { name: 'Default', description: 'Standard cursor', icon: '↖️', effect: 'none' },
  glow: { name: 'Glow', description: 'Glowing trail effect', icon: '✨', effect: 'glow', price: 75 },
  rainbow: { name: 'Rainbow', description: 'Rainbow trail', icon: '🌈', effect: 'rainbow', price: 100 },
  fire: { name: 'Fire', description: 'Fire particles', icon: '🔥', effect: 'fire', price: 125 },
  stars: { name: 'Stars', description: 'Starry trail', icon: '⭐', effect: 'stars', price: 100 },
};