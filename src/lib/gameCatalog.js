import { Target, Crosshair, Brain, Zap } from 'lucide-react';

export const categories = [
  {
    id: 'attention',
    nameKey: 'categoryAttention',
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

export const games = [
  // ATTENTION
  { gameId: 18, name: 'Selective Attention', category: 'attention', description: 'Name the color you see, not the word you read!', difficulty: 'Hard', skill: 'Selective Focus' },
  { gameId: 28, name: 'Find the Difference', category: 'attention', description: 'One shape is different — can you spot it?', difficulty: 'Easy', skill: 'Visual Discrimination' },
  { gameId: 22, name: 'Go/No-Go Reaction', category: 'attention', description: 'Tap when you see green, stop when you see red!', difficulty: 'Medium', skill: 'Inhibitory Control' },
  { gameId: 17, name: 'Hidden Target Search', category: 'attention', description: 'Find the sneaky target hiding in the crowd!', difficulty: 'Medium', skill: 'Visual Search' },
  { gameId: 10, name: 'Focus Grid', category: 'attention', description: 'Sort the shapes into the right buckets!', difficulty: 'Easy', skill: 'Sustained Attention' },
  { gameId: 11, name: 'Spot the Matching Shape', category: 'attention', description: 'Two shapes are twins — find them fast!', difficulty: 'Easy', skill: 'Pattern Matching' },
  { gameId: 26, name: 'Visual Scanning Challenge', category: 'attention', description: 'One color is odd — scan and find it!', difficulty: 'Medium', skill: 'Visual Scanning' },

  // TRACKING
  { gameId: 14, name: 'Visual Tracking Ball', category: 'tracking', description: 'Watch the light bounce and follow along!', difficulty: 'Easy', skill: 'Visual Tracking' },
  { gameId: 19, name: 'Follow the Target', category: 'tracking', description: 'Tap the target the moment it pops up!', difficulty: 'Easy', skill: 'Target Tracking' },
  { gameId: 20, name: 'Moving Object Click', category: 'tracking', description: 'Catch the wiggly targets as they zoom by!', difficulty: 'Medium', skill: 'Hand-Eye Coordination' },
  { gameId: 4, name: 'Multiple Object Tracking', category: 'tracking', description: 'Keep your eyes on four lanes at once!', difficulty: 'Hard', skill: 'Multi-Object Tracking' },
  { gameId: 15, name: 'Eye-Hand Coordination', category: 'tracking', description: 'Bop the objects before they reach you!', difficulty: 'Medium', skill: 'Coordination' },
  { gameId: 30, name: 'Path Following', category: 'tracking', description: 'Tap the numbers in the right order — follow the path!', difficulty: 'Medium', skill: 'Sequential Tracking' },
  { gameId: 35, name: 'Target Chase', category: 'tracking', description: 'Chase the targets and sort them super fast!', difficulty: 'Hard', skill: 'Dynamic Tracking' },

  // MEMORY
  { gameId: 7, name: 'Simon Sequence Memory', category: 'memory', description: 'Watch the pattern grow, then repeat it back!', difficulty: 'Medium', skill: 'Sequence Memory' },
  { gameId: 23, name: 'Pattern Copy', category: 'memory', description: 'Memorize the grid, then paint it again!', difficulty: 'Medium', skill: 'Spatial Memory' },
  { gameId: 3, name: 'Visual Memory Cards', category: 'memory', description: 'Flip cards and find the matching pairs!', difficulty: 'Easy', skill: 'Recognition Memory' },
  { gameId: 16, name: 'Sequence Recall', category: 'memory', description: 'Remember the order, then say it backwards!', difficulty: 'Hard', skill: 'Working Memory' },
  { gameId: 24, name: 'Remember the Positions', category: 'memory', description: 'Where did each shape go? Remember and repeat!', difficulty: 'Medium', skill: 'Positional Memory' },
  { gameId: 6, name: 'Number Memory', category: 'memory', description: 'Memorize the digits, then type them back!', difficulty: 'Medium', skill: 'Numeric Memory' },
  { gameId: 25, name: 'Shape Memory', category: 'memory', description: 'Was this shape here before? Think back!', difficulty: 'Hard', skill: 'Working Memory' },

  // PROCESSING SPEED
  { gameId: 1, name: 'Simple Reaction Time', category: 'speed', description: 'Tap the shape the moment it appears!', difficulty: 'Easy', skill: 'Reaction Speed' },
  { gameId: 2, name: 'Choice Reaction Time', category: 'speed', description: 'Pick the right color or shape — quick!', difficulty: 'Medium', skill: 'Decision Speed' },
  { gameId: 21, name: 'Color Recognition Speed', category: 'speed', description: 'Name that color as fast as you can!', difficulty: 'Easy', skill: 'Color Processing' },
  { gameId: 13, name: 'Match as Fast as Possible', category: 'speed', description: 'Do these shapes match? Decide in a flash!', difficulty: 'Medium', skill: 'Rapid Matching' },
  { gameId: 5, name: 'Rapid Sorting', category: 'speed', description: 'Find the odd one out — super quick!', difficulty: 'Medium', skill: 'Rapid Categorization' },
  { gameId: 32, name: 'Speed Comparison', category: 'speed', description: 'Higher or lower? Decide in a blink!', difficulty: 'Easy', skill: 'Quick Comparison' },
  { gameId: 34, name: 'Quick Decision Challenge', category: 'speed', description: 'Even or odd? Sort the numbers at top speed!', difficulty: 'Hard', skill: 'Rapid Classification' },
];

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