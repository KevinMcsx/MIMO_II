// HeartPets game engine — pure logic, no UI. Offline-first via localStorage.

export const CREATURES = [
  { id: 'dragon', name: 'Baby Dragon', emoji: '🐲', stages: ['🥚', '🐲', '🐉', '🐉✨', '🌟🐉'], color: 'from-orange-400 to-red-500', personality: 'bold' },
  { id: 'fox', name: 'Moon Fox', emoji: '🦊', stages: ['🥚', '🦊', '🦊🌙', '🦊✨', '🦊🌟'], color: 'from-indigo-400 to-purple-500', personality: 'curious' },
  { id: 'owl', name: 'Light Owl', emoji: '🦉', stages: ['🥚', '🦉', '🦉✨', '🦉🌙', '🦉🌟'], color: 'from-amber-300 to-yellow-500', personality: 'wise' },
  { id: 'cat', name: 'Cloud Cat', emoji: '🐱', stages: ['🥚', '🐱', '☁️🐱', '✨🐱', '🌟🐱'], color: 'from-sky-300 to-blue-400', personality: 'lazy' },
  { id: 'bunny', name: 'Star Bunny', emoji: '🐰', stages: ['🥚', '🐰', '✨🐰', '🌟🐰', '💫🐰'], color: 'from-pink-300 to-rose-400', personality: 'playful' },
];

export const STAGE_NAMES = ['Egg', 'Baby', 'Young', 'Adult', 'Legendary'];

export const CARE_ACTIONS = [
  { id: 'feed', label: 'Feed', icon: '🍎', stat: 'hunger', amount: 25, xp: 5 },
  { id: 'water', label: 'Water', icon: '💧', stat: 'thirst', amount: 25, xp: 5 },
  { id: 'clean', label: 'Clean', icon: '🛁', stat: 'cleanliness', amount: 30, xp: 5 },
  { id: 'sleep', label: 'Sleep', icon: '💤', stat: 'energy', amount: 40, xp: 3 },
  { id: 'play', label: 'Play', icon: '🎾', stat: 'happiness', amount: 20, xp: 8, costs: { energy: 10, hunger: 5 } },
  { id: 'pet', label: 'Pet', icon: '🤗', stat: 'affection', amount: 6, xp: 2 },
];

export const MOOD_INFO = {
  sick: { emoji: '🤒', label: 'Sick' },
  sleepy: { emoji: '😴', label: 'Sleepy' },
  sad: { emoji: '😢', label: 'Sad' },
  lonely: { emoji: '🥺', label: 'Lonely' },
  happy: { emoji: '😄', label: 'Happy' },
  playful: { emoji: '😸', label: 'Playful' },
  relaxed: { emoji: '😊', label: 'Relaxed' },
  proud: { emoji: '😻', label: 'Proud' },
};

export const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, v));

export function defaultPet(creatureId, name) {
  return {
    creatureId,
    name: name || 'Companion',
    stage: 0,
    stats: { hunger: 80, thirst: 80, happiness: 80, energy: 80, cleanliness: 80, health: 100, intelligence: 10, affection: 10 },
    xp: 0,
    level: 1,
    coins: 50,
    lastUpdated: Date.now(),
    bornAt: Date.now(),
    careCount: 0,
  };
}

export function calcMood(s) {
  if (s.health < 30) return 'sick';
  if (s.energy < 25) return 'sleepy';
  if (s.hunger < 30 || s.thirst < 30) return 'sad';
  if (s.happiness < 35) return 'lonely';
  if (s.happiness > 75 && s.hunger > 60 && s.thirst > 60) return 'happy';
  if (s.happiness > 60) return 'playful';
  return 'relaxed';
}

// Apply time-based stat decay since lastUpdated
export function applyDecay(pet) {
  if (!pet) return pet;
  const now = Date.now();
  const hours = (now - (pet.lastUpdated || now)) / 3600000;
  if (hours <= 0) return { ...pet, mood: calcMood(pet.stats) };
  const s = { ...pet.stats };
  s.hunger = clamp(s.hunger - hours * 8);
  s.thirst = clamp(s.thirst - hours * 10);
  s.energy = clamp(s.energy - hours * 4);
  s.cleanliness = clamp(s.cleanliness - hours * 3);
  const needPenalty = (100 - s.hunger) + (100 - s.thirst);
  s.happiness = clamp(s.happiness - hours * (4 + needPenalty * 0.05));
  if (s.hunger < 20 || s.thirst < 20) s.health = clamp(s.health - hours * 5);
  else if (s.hunger > 60 && s.thirst > 60 && s.health < 100) s.health = clamp(s.health + hours * 2);
  return { ...pet, stats: s, lastUpdated: now, mood: calcMood(s) };
}

const avgStats = (s) => (s.hunger + s.thirst + s.happiness + s.energy + s.cleanliness + s.health) / 6;
const xpForLevel = (lvl) => lvl * 50;

export function applyCare(pet, action) {
  const s = { ...pet.stats };
  s[action.stat] = clamp(s[action.stat] + action.amount);
  if (action.costs) for (const k in action.costs) s[k] = clamp(s[k] - action.costs[k]);
  if (action.id === 'feed' && s.hunger > 70 && s.health < 100) s.health = clamp(s.health + 2);

  let xp = pet.xp + action.xp;
  let level = pet.level;
  let coins = pet.coins;
  let stage = pet.stage;
  const careCount = pet.careCount + 1;

  while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++; coins += 20; }

  if (stage === 0 && careCount >= 1) stage = 1; // hatch
  if (stage === 1 && level >= 3 && s.happiness > 50) stage = 2;
  else if (stage === 2 && level >= 6 && avgStats(s) > 40) stage = 3;
  else if (stage === 3 && level >= 10 && avgStats(s) > 60) stage = 4;

  return { ...pet, stats: s, xp, level, coins, stage, careCount, lastUpdated: Date.now() };
}

export function xpProgress(pet) {
  const need = xpForLevel(pet.level);
  return { current: pet.xp, need, pct: Math.min(100, (pet.xp / need) * 100) };
}