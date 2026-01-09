// Cosmetic items configuration

export const AVATARS = {
  default: { emoji: '😊', name: 'Default', color: 'bg-slate-200' },
  star: { emoji: '⭐', name: 'Star', color: 'bg-yellow-200' },
  fire: { emoji: '🔥', name: 'Fire', color: 'bg-orange-200' },
  lightning: { emoji: '⚡', name: 'Lightning', color: 'bg-yellow-300' },
  crown: { emoji: '👑', name: 'Crown', color: 'bg-yellow-400' },
  gem: { emoji: '💎', name: 'Gem', color: 'bg-blue-300' },
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