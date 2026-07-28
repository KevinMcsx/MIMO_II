import { Target, Crosshair, Brain, Zap } from 'lucide-react';

export const categories = [
  {
    id: 'attention',
    nameKey: 'categoryAttention',
    description: 'Train your ability to focus, filter distractions, and sustain attention on what matters.',
    Icon: Target,
    bgClass: 'bg-blue-50',
    iconBgClass: 'bg-blue-100',
    iconTextClass: 'text-blue-600',
    accentClass: 'bg-blue-500',
    borderClass: 'border-blue-200',
    progressClass: 'bg-blue-400',
    textClass: 'text-blue-700',
  },
  {
    id: 'tracking',
    nameKey: 'categoryTracking',
    description: 'Improve following and responding to moving targets with precision.',
    Icon: Crosshair,
    bgClass: 'bg-emerald-50',
    iconBgClass: 'bg-emerald-100',
    iconTextClass: 'text-emerald-600',
    accentClass: 'bg-emerald-500',
    borderClass: 'border-emerald-200',
    progressClass: 'bg-emerald-400',
    textClass: 'text-emerald-700',
  },
  {
    id: 'memory',
    nameKey: 'categoryMemory',
    description: 'Strengthen your short-term, working, and spatial memory skills.',
    Icon: Brain,
    bgClass: 'bg-violet-50',
    iconBgClass: 'bg-violet-100',
    iconTextClass: 'text-violet-600',
    accentClass: 'bg-violet-500',
    borderClass: 'border-violet-200',
    progressClass: 'bg-violet-400',
    textClass: 'text-violet-700',
  },
  {
    id: 'speed',
    nameKey: 'categoryProcessingSpeed',
    description: 'Boost your reaction time and mental processing speed.',
    Icon: Zap,
    bgClass: 'bg-amber-50',
    iconBgClass: 'bg-amber-100',
    iconTextClass: 'text-amber-600',
    accentClass: 'bg-amber-500',
    borderClass: 'border-amber-200',
    progressClass: 'bg-amber-400',
    textClass: 'text-amber-700',
  },
];

export const games = [
  // ATTENTION
  { gameId: 18, name: 'Selective Attention', category: 'attention', description: 'Identify the ink color of words while ignoring what they say.', difficulty: 'Hard', skill: 'Selective Focus' },
  { gameId: 28, name: 'Find the Difference', category: 'attention', description: 'Spot the shape that differs from the rest.', difficulty: 'Easy', skill: 'Visual Discrimination' },
  { gameId: 22, name: 'Go/No-Go Reaction', category: 'attention', description: 'Tap on targets, hold back on distractors.', difficulty: 'Medium', skill: 'Inhibitory Control' },
  { gameId: 17, name: 'Hidden Target Search', category: 'attention', description: 'Find the hidden target among distractors.', difficulty: 'Medium', skill: 'Visual Search' },
  { gameId: 10, name: 'Focus Grid', category: 'attention', description: 'Sort shapes by rule while staying focused.', difficulty: 'Easy', skill: 'Sustained Attention' },
  { gameId: 11, name: 'Spot the Matching Shape', category: 'attention', description: 'Find the two identical shapes quickly.', difficulty: 'Easy', skill: 'Pattern Matching' },
  { gameId: 26, name: 'Visual Scanning Challenge', category: 'attention', description: 'Scan the grid and find the odd-colored item.', difficulty: 'Medium', skill: 'Visual Scanning' },

  // TRACKING
  { gameId: 14, name: 'Visual Tracking Ball', category: 'tracking', description: 'Follow the light as it moves across the grid.', difficulty: 'Easy', skill: 'Visual Tracking' },
  { gameId: 19, name: 'Follow the Target', category: 'tracking', description: 'Track and tap the target as it appears.', difficulty: 'Easy', skill: 'Target Tracking' },
  { gameId: 20, name: 'Moving Object Click', category: 'tracking', description: 'Click moving targets as fast as you can.', difficulty: 'Medium', skill: 'Hand-Eye Coordination' },
  { gameId: 4, name: 'Multiple Object Tracking', category: 'tracking', description: 'Track multiple objects across four lanes.', difficulty: 'Hard', skill: 'Multi-Object Tracking' },
  { gameId: 15, name: 'Eye-Hand Coordination', category: 'tracking', description: 'Tap incoming objects to keep the field clear.', difficulty: 'Medium', skill: 'Coordination' },
  { gameId: 30, name: 'Path Following', category: 'tracking', description: 'Follow and tap objects in the correct path.', difficulty: 'Medium', skill: 'Sequential Tracking' },
  { gameId: 35, name: 'Target Chase', category: 'tracking', description: 'Chase and sort targets before they escape.', difficulty: 'Hard', skill: 'Dynamic Tracking' },

  // MEMORY
  { gameId: 7, name: 'Simon Sequence Memory', category: 'memory', description: 'Watch and repeat the growing sequence.', difficulty: 'Medium', skill: 'Sequence Memory' },
  { gameId: 23, name: 'Pattern Copy', category: 'memory', description: 'Memorize and recreate the highlighted pattern.', difficulty: 'Medium', skill: 'Spatial Memory' },
  { gameId: 3, name: 'Visual Memory Cards', category: 'memory', description: 'Match pairs of cards from memory.', difficulty: 'Easy', skill: 'Recognition Memory' },
  { gameId: 16, name: 'Sequence Recall', category: 'memory', description: 'Recall the sequence in reverse order.', difficulty: 'Hard', skill: 'Working Memory' },
  { gameId: 24, name: 'Remember the Positions', category: 'memory', description: 'Remember where each shape appeared.', difficulty: 'Medium', skill: 'Positional Memory' },
  { gameId: 6, name: 'Number Memory', category: 'memory', description: 'Memorize and recall the number sequence.', difficulty: 'Medium', skill: 'Numeric Memory' },
  { gameId: 25, name: 'Shape Memory', category: 'memory', description: 'Remember if the current shape matched N steps back.', difficulty: 'Hard', skill: 'Working Memory' },

  // PROCESSING SPEED
  { gameId: 1, name: 'Simple Reaction Time', category: 'speed', description: 'React to the shape as fast as possible.', difficulty: 'Easy', skill: 'Reaction Speed' },
  { gameId: 2, name: 'Choice Reaction Time', category: 'speed', description: 'Choose the correct color or shape quickly.', difficulty: 'Medium', skill: 'Decision Speed' },
  { gameId: 21, name: 'Color Recognition Speed', category: 'speed', description: 'Identify the correct color at top speed.', difficulty: 'Easy', skill: 'Color Processing' },
  { gameId: 13, name: 'Match as Fast as Possible', category: 'speed', description: 'Decide if shapes match, quickly.', difficulty: 'Medium', skill: 'Rapid Matching' },
  { gameId: 5, name: 'Rapid Sorting', category: 'speed', description: 'Find the odd shape in the grid, fast.', difficulty: 'Medium', skill: 'Rapid Categorization' },
  { gameId: 32, name: 'Speed Comparison', category: 'speed', description: 'Quickly decide: higher or lower?', difficulty: 'Easy', skill: 'Quick Comparison' },
  { gameId: 34, name: 'Quick Decision Challenge', category: 'speed', description: 'Split numbers into even or odd at speed.', difficulty: 'Hard', skill: 'Rapid Classification' },
];

export function getGamesByCategory(categoryId) {
  return games.filter(g => g.category === categoryId);
}

export function getCategoryById(categoryId) {
  return categories.find(c => c.id === categoryId);
}

const difficultyColors = {
  Easy: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  Hard: { bg: 'bg-rose-100', text: 'text-rose-700', dot: 'bg-rose-500' },
};

export function getDifficultyStyle(difficulty) {
  return difficultyColors[difficulty] || difficultyColors.Medium;
}