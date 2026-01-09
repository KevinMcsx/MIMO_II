// XP and leveling system

// XP requirements for each level (cumulative)
export const XP_PER_LEVEL = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, // Levels 1-10
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450, // Levels 11-20
  11500, 12600, 13750, 14950, 16200, 17500, 18850, 20250, 21700, 23200, // Levels 21-30
];

// Calculate XP gained from a game
export function calculateXP(gameResult) {
  const { game_type, difficulty, score, correct_hits, avg_reaction_time } = gameResult;
  
  let baseXP = 50;
  
  // Game type multiplier
  const gameMultiplier = [1, 1.2, 1.3, 1.5][game_type - 1] || 1;
  
  // Difficulty multiplier
  const difficultyMultiplier = [1, 1.5, 2, 2.5][difficulty - 1] || 1;
  
  // Performance bonus
  let performanceBonus = 0;
  if (correct_hits >= 50) performanceBonus += 20;
  if (correct_hits >= 100) performanceBonus += 30;
  if (avg_reaction_time && avg_reaction_time < 500) performanceBonus += 25;
  if (avg_reaction_time && avg_reaction_time < 300) performanceBonus += 25;
  
  const totalXP = Math.floor((baseXP * gameMultiplier * difficultyMultiplier) + performanceBonus);
  
  return totalXP;
}

// Get level from XP
export function getLevelFromXP(xp) {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) {
      return i + 1;
    }
  }
  return 1;
}

// Get XP needed for next level
export function getXPForNextLevel(currentLevel) {
  if (currentLevel >= XP_PER_LEVEL.length) return Infinity;
  return XP_PER_LEVEL[currentLevel];
}

// Get XP progress in current level
export function getCurrentLevelProgress(xp, level) {
  const currentLevelXP = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXP = getXPForNextLevel(level);
  
  if (nextLevelXP === Infinity) return { current: 0, needed: 1, percentage: 100 };
  
  const current = xp - currentLevelXP;
  const needed = nextLevelXP - currentLevelXP;
  const percentage = Math.floor((current / needed) * 100);
  
  return { current, needed, percentage };
}

// Unlock logic based on level
export function getUnlocksForLevel(level) {
  const unlocks = [];
  
  if (level >= 3) unlocks.push({ type: 'game', id: 3, name: 'Memory Match' });
  if (level >= 5) unlocks.push({ type: 'difficulty', game: 1, id: 2, name: 'Medium Difficulty for Color Reaction' });
  if (level >= 5) unlocks.push({ type: 'difficulty', game: 3, id: 2, name: 'Medium Difficulty for Memory Match' });
  if (level >= 7) unlocks.push({ type: 'game', id: 2, name: 'Color + Shape' });
  if (level >= 10) unlocks.push({ type: 'difficulty', game: 1, id: 3, name: 'Hard Difficulty for Color Reaction' });
  if (level >= 10) unlocks.push({ type: 'difficulty', game: 2, id: 2, name: 'Medium Difficulty for Color + Shape' });
  if (level >= 10) unlocks.push({ type: 'difficulty', game: 3, id: 3, name: 'Hard Difficulty for Memory Match' });
  if (level >= 12) unlocks.push({ type: 'theme', id: 'ocean', name: 'Ocean Theme' });
  if (level >= 15) unlocks.push({ type: 'game', id: 4, name: 'Pro Challenge' });
  if (level >= 15) unlocks.push({ type: 'difficulty', game: 2, id: 3, name: 'Hard Difficulty for Color + Shape' });
  if (level >= 18) unlocks.push({ type: 'theme', id: 'sunset', name: 'Sunset Theme' });
  if (level >= 20) unlocks.push({ type: 'difficulty', game: 1, id: 4, name: 'Expert Difficulty for Color Reaction' });
  if (level >= 20) unlocks.push({ type: 'difficulty', game: 2, id: 4, name: 'Expert Difficulty for Color + Shape' });
  if (level >= 20) unlocks.push({ type: 'difficulty', game: 3, id: 4, name: 'Expert Difficulty for Memory Match' });
  if (level >= 20) unlocks.push({ type: 'difficulty', game: 4, id: 2, name: 'Medium Difficulty for Pro Challenge' });
  if (level >= 25) unlocks.push({ type: 'difficulty', game: 4, id: 3, name: 'Hard Difficulty for Pro Challenge' });
  if (level >= 25) unlocks.push({ type: 'theme', id: 'neon', name: 'Neon Theme' });
  if (level >= 30) unlocks.push({ type: 'difficulty', game: 4, id: 4, name: 'Expert Difficulty for Pro Challenge' });
  
  return unlocks;
}

// Get all unlocks up to a certain level
export function getAllUnlocksUpToLevel(level) {
  const allUnlocks = {
    games: [1],
    difficulties: { 1: [1], 2: [1], 3: [1], 4: [1] },
    themes: ['default']
  };
  
  for (let i = 2; i <= level; i++) {
    const unlocks = getUnlocksForLevel(i);
    unlocks.forEach(unlock => {
      if (unlock.type === 'game' && !allUnlocks.games.includes(unlock.id)) {
        allUnlocks.games.push(unlock.id);
      } else if (unlock.type === 'difficulty') {
        if (!allUnlocks.difficulties[unlock.game].includes(unlock.id)) {
          allUnlocks.difficulties[unlock.game].push(unlock.id);
        }
      } else if (unlock.type === 'theme' && !allUnlocks.themes.includes(unlock.id)) {
        allUnlocks.themes.push(unlock.id);
      }
    });
  }
  
  return allUnlocks;
}