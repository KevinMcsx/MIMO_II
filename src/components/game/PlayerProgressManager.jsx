import { base44 } from '@/api/base44Client';
import { calculateXP, getLevelFromXP, getUnlocksForLevel, getAllUnlocksUpToLevel } from './ProgressionSystem';

const PROFILE_STORAGE_KEY = 'mimo_player_profiles';

// LocalStorage helpers
const saveProfileToLocalStorage = (profile) => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    const profiles = stored ? JSON.parse(stored) : {};
    profiles[profile.player_name] = profile;
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error('Failed to save profile to localStorage:', error);
  }
};

const getProfileFromLocalStorage = (playerName) => {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) {
      const profiles = JSON.parse(stored);
      return profiles[playerName] || null;
    }
  } catch (error) {
    console.error('Failed to get profile from localStorage:', error);
  }
  return null;
};

const createDefaultProfile = (playerName) => {
  return {
    id: `local_${Date.now()}`,
    player_name: playerName,
    level: 1,
    xp: 0,
    total_xp: 0,
    coins: 0,
    unlocked_games: [1],
    unlocked_difficulties: { 1: [1], 2: [1], 3: [1], 4: [1] },
    cosmetic_theme: 'default',
    unlocked_themes: ['default'],
    unlocked_avatars: ['default'],
    unlocked_badges: [],
    unlocked_frames: ['default'],
    unlocked_sound_packs: ['default'],
    unlocked_cursors: ['default'],
    equipped_avatar: 'default',
    equipped_badge: null,
    equipped_frame: 'default',
    equipped_sound_pack: 'default',
    equipped_cursor: 'default',
    achievements: []
  };
};

// Get or create player profile
export async function getPlayerProfile(playerName) {
  if (!playerName) return null;
  
  try {
    const profiles = await base44.entities.PlayerProfile.filter({ player_name: playerName });
    
    if (profiles.length > 0) {
      // Save to localStorage as backup
      saveProfileToLocalStorage(profiles[0]);
      return profiles[0];
    } else {
      // Create new profile in database
      const newProfile = await base44.entities.PlayerProfile.create({
        player_name: playerName,
        level: 1,
        xp: 0,
        total_xp: 0,
        coins: 0,
        unlocked_games: [1],
        unlocked_difficulties: { 1: [1], 2: [1], 3: [1], 4: [1] },
        cosmetic_theme: 'default',
        unlocked_themes: ['default'],
        unlocked_avatars: ['default'],
        unlocked_badges: [],
        unlocked_frames: ['default'],
        unlocked_sound_packs: ['default'],
        unlocked_cursors: ['default'],
        equipped_avatar: 'default',
        equipped_badge: null,
        equipped_frame: 'default',
        equipped_sound_pack: 'default',
        equipped_cursor: 'default',
        achievements: []
      });
      saveProfileToLocalStorage(newProfile);
      return newProfile;
    }
  } catch (error) {
    console.error('Error fetching player profile from database, using localStorage:', error);
    // Fallback to localStorage
    let localProfile = getProfileFromLocalStorage(playerName);
    if (!localProfile) {
      localProfile = createDefaultProfile(playerName);
      saveProfileToLocalStorage(localProfile);
    }
    return localProfile;
  }
}

// Award XP and update profile
export async function awardXP(playerName, gameResult) {
  const profile = await getPlayerProfile(playerName);
  if (!profile) return null;
  
  const xpGained = calculateXP(gameResult);
  const coinsGained = gameResult.score;
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
    
    const updatedData = {
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
    };
    
    try {
      await base44.entities.PlayerProfile.update(profile.id, updatedData);
    } catch (error) {
      console.error('Failed to update profile in database, saving to localStorage only:', error);
    }
    
    // Always save to localStorage
    const updatedProfile = { ...profile, ...updatedData };
    saveProfileToLocalStorage(updatedProfile);
  } else {
    const updatedData = {
      xp: newTotalXP,
      total_xp: newTotalXP,
      coins: newCoins
    };
    
    try {
      await base44.entities.PlayerProfile.update(profile.id, updatedData);
    } catch (error) {
      console.error('Failed to update profile in database, saving to localStorage only:', error);
    }
    
    // Always save to localStorage
    const updatedProfile = { ...profile, ...updatedData };
    saveProfileToLocalStorage(updatedProfile);
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