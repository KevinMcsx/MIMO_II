import { gameDefinitions } from './gameDefinitions';
import { Target, Crosshair, Brain, Zap } from 'lucide-react';

export const categories = [
  {
    id: 'attention',
    nameKey: 'categoryAttention',
    descKey: 'catAttentionDesc',
    description: 'Focus your eyes and find what hides in plain sight!',
    emoji: '🔍',
    Icon: Target,
    bgClass: 'bg-gradient-to-br from-sky-400 to-blue-500',
    iconBgClass: 'bg-white/30',
    iconTextClass: 'text-white',
    accentClass: 'bg-gradient-to-r from-sky-400 to-blue-500',
    borderClass: 'border-white/40',
    progressClass: 'bg-white',
    textClass: 'text-white',
    cardShadow: 'shadow-blue-500/40',
  },
  {
    id: 'tracking',
    nameKey: 'categoryTracking',
    descKey: 'catTrackingDesc',
    description: 'Follow things that zoom and wiggle across the screen!',
    emoji: '🎯',
    Icon: Crosshair,
    bgClass: 'bg-gradient-to-br from-emerald-400 to-green-500',
    iconBgClass: 'bg-white/30',
    iconTextClass: 'text-white',
    accentClass: 'bg-gradient-to-r from-emerald-400 to-green-500',
    borderClass: 'border-white/40',
    progressClass: 'bg-white',
    textClass: 'text-white',
    cardShadow: 'shadow-green-500/40',
  },
  {
    id: 'memory',
    nameKey: 'categoryMemory',
    descKey: 'catMemoryDesc',
    description: 'Remember the patterns and match the pairs!',
    emoji: '🧠',
    Icon: Brain,
    bgClass: 'bg-gradient-to-br from-violet-400 to-purple-500',
    iconBgClass: 'bg-white/30',
    iconTextClass: 'text-white',
    accentClass: 'bg-gradient-to-r from-violet-400 to-purple-500',
    borderClass: 'border-white/40',
    progressClass: 'bg-white',
    textClass: 'text-white',
    cardShadow: 'shadow-purple-500/40',
  },
  {
    id: 'speed',
    nameKey: 'categoryProcessingSpeed',
    descKey: 'catSpeedDesc',
    description: 'Tap fast and think quick — how speedy are you?',
    emoji: '⚡',
    Icon: Zap,
    bgClass: 'bg-gradient-to-br from-amber-400 to-orange-500',
    iconBgClass: 'bg-white/30',
    iconTextClass: 'text-white',
    accentClass: 'bg-gradient-to-r from-amber-400 to-orange-500',
    borderClass: 'border-white/40',
    progressClass: 'bg-white',
    textClass: 'text-white',
    cardShadow: 'shadow-orange-500/40',
  },
];

const categoryGames = [
  // ATTENTION
  { gameId: 18, category: 'attention', description: 'Name the color you see, not the word you read!', difficulty: 'Hard', skill: 'Selective Focus' },
  { gameId: 28, category: 'attention', description: 'One shape is different — can you spot it?', difficulty: 'Easy', skill: 'Visual Discrimination' },
  { gameId: 22, category: 'attention', description: 'Tap when you see green, stop when you see red!', difficulty: 'Medium', skill: 'Inhibitory Control' },
  { gameId: 17, category: 'attention', description: 'Find the sneaky target hiding in the crowd!', difficulty: 'Medium', skill: 'Visual Search' },
  { gameId: 10, category: 'attention', description: 'Sort the shapes into the right buckets!', difficulty: 'Easy', skill: 'Sustained Attention' },
  { gameId: 11, category: 'attention', description: 'Two shapes are twins — find them fast!', difficulty: 'Easy', skill: 'Pattern Matching' },
  { gameId: 26, category: 'attention', description: 'One color is odd — scan and find it!', difficulty: 'Medium', skill: 'Visual Scanning' },

  // TRACKING
  { gameId: 14, category: 'tracking', description: 'Watch the light bounce and follow along!', difficulty: 'Easy', skill: 'Visual Tracking' },
  { gameId: 19, category: 'tracking', description: 'Tap the target the moment it pops up!', difficulty: 'Easy', skill: 'Target Tracking' },
  { gameId: 20, category: 'tracking', description: 'Catch the wiggly targets as they zoom by!', difficulty: 'Medium', skill: 'Hand-Eye Coordination' },
  { gameId: 4, category: 'tracking', description: 'Keep your eyes on four lanes at once!', difficulty: 'Hard', skill: 'Multi-Object Tracking' },
  { gameId: 15, category: 'tracking', description: 'Bop the objects before they reach you!', difficulty: 'Medium', skill: 'Coordination' },
  { gameId: 30, category: 'tracking', description: 'Tap the numbers in the right order — follow the path!', difficulty: 'Medium', skill: 'Sequential Tracking' },
  { gameId: 35, category: 'tracking', description: 'Chase the targets and sort them super fast!', difficulty: 'Hard', skill: 'Dynamic Tracking' },

  // MEMORY
  { gameId: 7, category: 'memory', description: 'Watch the pattern grow, then repeat it back!', difficulty: 'Medium', skill: 'Sequence Memory' },
  { gameId: 23, category: 'memory', description: 'Memorize the grid, then paint it again!', difficulty: 'Medium', skill: 'Spatial Memory' },
  { gameId: 3, category: 'memory', description: 'Flip cards and find the matching pairs!', difficulty: 'Easy', skill: 'Recognition Memory' },
  { gameId: 16, category: 'memory', description: 'Remember the order, then say it backwards!', difficulty: 'Hard', skill: 'Working Memory' },
  { gameId: 24, category: 'memory', description: 'Where did each shape go? Remember and repeat!', difficulty: 'Medium', skill: 'Positional Memory' },
  { gameId: 6, category: 'memory', description: 'Memorize the digits, then type them back!', difficulty: 'Medium', skill: 'Numeric Memory' },
  { gameId: 25, category: 'memory', description: 'Was this shape here before? Think back!', difficulty: 'Hard', skill: 'Working Memory' },

  // PROCESSING SPEED
  { gameId: 1, category: 'speed', description: 'Tap the shape the moment it appears!', difficulty: 'Easy', skill: 'Reaction Speed' },
  { gameId: 2, category: 'speed', description: 'Pick the right color or shape — quick!', difficulty: 'Medium', skill: 'Decision Speed' },
  { gameId: 21, category: 'speed', description: 'Name that color as fast as you can!', difficulty: 'Easy', skill: 'Color Processing' },
  { gameId: 13, category: 'speed', description: 'Do these shapes match? Decide in a flash!', difficulty: 'Medium', skill: 'Rapid Matching' },
  { gameId: 5, category: 'speed', description: 'Find the odd one out — super quick!', difficulty: 'Medium', skill: 'Rapid Categorization' },
  { gameId: 32, category: 'speed', description: 'Higher or lower? Decide in a blink!', difficulty: 'Easy', skill: 'Quick Comparison' },
  { gameId: 34, category: 'speed', description: 'Even or odd? Sort the numbers at top speed!', difficulty: 'Hard', skill: 'Rapid Classification' },
];

const extraCategories = {"8": "attention", "9": "memory", "12": "speed", "27": "attention", "29": "speed", "31": "speed", "33": "memory", "36": "attention"};
const menuIds = [...categoryGames.map(game => game.gameId), ...Object.keys(extraCategories).map(Number)];
export const games = menuIds.map(id => {
  const game = gameDefinitions[id - 1];
  const details = categoryGames.find(entry => entry.gameId === game.id);
  return {
    ...details,
    gameId: game.id,
    name: game.name,
    nameKey: game.nameKey,
    descKey: 'game' + game.id + 'Desc',
    category: details?.category ?? extraCategories[game.id],
    description: details?.description ?? '',
    difficulty: details?.difficulty ?? 'Medium',
    skill: details?.skill ?? '',
  };
});

export function getGamesByCategory(categoryId) {
  return games.filter(g => g.category === categoryId);
}

export function getCategoryById(categoryId) {
  return categories.find(c => c.id === categoryId);
}

const difficultyStyles = {
  Easy: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500', emoji: '😊' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500', emoji: '🤔' },
  Hard: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500', emoji: '🔥' },
};

export function getDifficultyStyle(difficulty) {
  return difficultyStyles[difficulty] || difficultyStyles.Medium;
}