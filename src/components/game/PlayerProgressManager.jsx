import { base44 } from '@/api/base44Client';
import { calculateXP, getLevelFromXP, getUnlocksForLevel, getAllUnlocksUpToLevel } from './ProgressionSystem';

// Get or create player profile
export async function getPlayerProfile(playerName) {
  if (!playerName) return null;
  
  try {
    const profiles = await base44.entities.PlayerProfile.filter({ player_name: playerName });
    
    if (profiles.length > 0) {
      return profiles[0];
    } else {
      // Create new profile
      const newProfile = await base44.entities.PlayerProfile.create({
        player_name: playerName,
        level: 1,
        xp: 0,
        total_xp: 0,
        unlocked_games: [1],
        unlocked_difficulties: { 1: [1], 2: [1], 3: [1], 4: [1] },
        cosmetic_theme: 'default',
        unlocked_themes: ['default'],
        achievements: []
      });
      return newProfile;
    }
  } catch (error) {
    console.error('Error fetching player profile:', error);
    return null;
  }
}

// Award XP and update profile
export async function awardXP(playerName, gameResult) {
  const profile = await getPlayerProfile(playerName);
  if (!profile) return null;
  
  const xpGained = calculateXP(gameResult);
  const coinsGained = Math.floor(gameResult.score / 2);
  const newTotalXP = profile.total_xp + xpGained;
  const newCoins = (profile.coins || 0) + coinsGained;
  const oldLevel = profile.level;
  const newLevel = getLevelFromXP(newTotalXP);
  
  const leveledUp = newLevel > oldLevel;
  const newUnlocks = [];
  
  // Get new unlocks
  if (leveledUp) {
    for (let i = oldLevel + 1; i <= newLevel; i++) {
      const unlocks = getUnlocksForLevel(i);
      newUnlocks.push(...unlocks);
    }
    
    // Update unlocks in profile
    const allUnlocks = getAllUnlocksUpToLevel(newLevel);
    
    await base44.entities.PlayerProfile.update(profile.id, {
      level: newLevel,
      xp: newTotalXP,
      total_xp: newTotalXP,
      coins: newCoins,
      unlocked_games: allUnlocks.games,
      unlocked_difficulties: allUnlocks.difficulties,
      unlocked_themes: allUnlocks.themes,
      unlocked_avatars: allUnlocks.avatars,
      unlocked_badges: allUnlocks.badges,
      unlocked_frames: allUnlocks.frames,
      unlocked_sound_packs: allUnlocks.sound_packs,
      unlocked_cursors: allUnlocks.cursors
    });
  } else {
    await base44.entities.PlayerProfile.update(profile.id, {
      xp: newTotalXP,
      total_xp: newTotalXP,
      coins: newCoins
    });
  }
  
  return {
    xpGained,
    coinsGained,
    leveledUp,
    oldLevel,
    newLevel,
    newUnlocks,
    profile: { ...profile, level: newLevel, xp: newTotalXP, total_xp: newTotalXP, coins: newCoins }
  };
}