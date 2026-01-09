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
  },
  sunset: {
    name: 'Sunset',
    gradient: 'from-orange-100 via-pink-200 to-purple-100',
    primaryColor: 'orange',
  },
  neon: {
    name: 'Neon',
    gradient: 'from-pink-200 via-purple-300 to-blue-200',
    primaryColor: 'pink',
  },
  galaxy: {
    name: 'Galaxy',
    gradient: 'from-indigo-200 via-purple-300 to-pink-200',
    primaryColor: 'indigo',
  },
};

export const SOUND_PACKS = {
  default: { name: 'Classic', description: 'Original game sounds', icon: '🎵' },
  retro: { name: 'Retro', description: '8-bit arcade sounds', icon: '🕹️', price: 100 },
  nature: { name: 'Nature', description: 'Calm nature sounds', icon: '🌿', price: 125 },
  space: { name: 'Space', description: 'Futuristic space sounds', icon: '🚀', price: 150 },
  drums: { name: 'Drums', description: 'Percussion sounds', icon: '🥁', price: 100 },
};

export const CURSORS = {
  default: { name: 'Default', description: 'Standard cursor', icon: '↖️', effect: 'none' },
  glow: { name: 'Glow', description: 'Glowing trail effect', icon: '✨', effect: 'glow', price: 75 },
  rainbow: { name: 'Rainbow', description: 'Rainbow trail', icon: '🌈', effect: 'rainbow', price: 100 },
  fire: { name: 'Fire', description: 'Fire particles', icon: '🔥', effect: 'fire', price: 125 },
  stars: { name: 'Stars', description: 'Starry trail', icon: '⭐', effect: 'stars', price: 100 },
};