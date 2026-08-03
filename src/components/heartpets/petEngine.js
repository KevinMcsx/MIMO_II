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

// Apply time-based stat decay since lastUpdated (also advances growth over time)
export function applyDecay(pet) {
  if (!pet) return pet;
  const now = Date.now();
  const hours = (now - (pet.lastUpdated || now)) / 3600000;
  if (hours <= 0) {
    const stage = developStage(pet.stage, pet.level, pet.careCount, pet.bornAt, pet.stats, now);
    return { ...pet, stage, mood: calcMood(pet.stats) };
  }
  const s = { ...pet.stats };
  s.hunger = clamp(s.hunger - hours * 8);
  s.thirst = clamp(s.thirst - hours * 10);
  s.energy = clamp(s.energy - hours * 4);
  s.cleanliness = clamp(s.cleanliness - hours * 3);
  const needPenalty = (100 - s.hunger) + (100 - s.thirst);
  s.happiness = clamp(s.happiness - hours * (4 + needPenalty * 0.05));
  if (s.hunger < 20 || s.thirst < 20) s.health = clamp(s.health - hours * 5);
  else if (s.hunger > 60 && s.thirst > 60 && s.health < 100) s.health = clamp(s.health + hours * 2);
  const stage = developStage(pet.stage, pet.level, pet.careCount, pet.bornAt, s, now);
  return { ...pet, stats: s, stage, lastUpdated: now, mood: calcMood(s) };
}

const avgStats = (s) => (s.hunger + s.thirst + s.happiness + s.energy + s.cleanliness + s.health) / 6;
const xpForLevel = (lvl) => lvl * 50;

// --- Time-based growth ---
// Real-time thresholds. Egg incubates over HATCH_MS (warmth from care speeds it up);
// each later stage needs a minimum age, so creatures develop over real time.
export const HATCH_MS = 2 * 60 * 1000;                                   // 2 min to hatch (passive)
export const STAGE_AGE_MS = [0, HATCH_MS, 8 * 60 * 1000, 25 * 60 * 1000, 60 * 60 * 1000];

export const ageMs = (pet, now = Date.now()) => Math.max(0, now - (pet.bornAt || now));

// Human-readable age label (e.g. "3m", "2h 15m", "1d 4h").
export function ageLabel(pet, now = Date.now()) {
  const ms = ageMs(pet, now);
  const m = Math.floor(ms / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d ${h % 24}h`;
}

// Incubation progress (0..100) toward hatching — time-based + care warmth.
export function incubationProgress(pet, now = Date.now()) {
  const warmth = Math.min(60, (pet.careCount || 0) * 12);
  return Math.min(100, (ageMs(pet, now) / HATCH_MS) * 100 + warmth);
}

// Resolve the creature's stage from age + level + stats. Only ever advances.
function developStage(stage, level, careCount, bornAt, s, now) {
  const age = Math.max(0, now - (bornAt || now));
  if (stage === 0) {
    const warmth = Math.min(60, (careCount || 0) * 12);
    if ((age / HATCH_MS) * 100 + warmth >= 100) stage = 1;
  }
  if (stage === 1 && level >= 3 && age >= STAGE_AGE_MS[2] && s.happiness > 50) stage = 2;
  else if (stage === 2 && level >= 6 && age >= STAGE_AGE_MS[3] && avgStats(s) > 40) stage = 3;
  else if (stage === 3 && level >= 10 && age >= STAGE_AGE_MS[4] && avgStats(s) > 60) stage = 4;
  return stage;
}

// Shared XP/level/evolution processing.
function processXp(pet, xpGain, s, now) {
  let xp = pet.xp + xpGain;
  let level = pet.level;
  let coins = pet.coins;
  while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++; coins += 20; }
  const stage = developStage(pet.stage, level, pet.careCount, pet.bornAt, s, now);
  return { xp, level, coins, stage };
}

export function applyCare(pet, action) {
  const s = { ...pet.stats };
  s[action.stat] = clamp(s[action.stat] + action.amount);
  if (action.costs) for (const k in action.costs) s[k] = clamp(s[k] - action.costs[k]);
  if (action.id === 'feed' && s.hunger > 70 && s.health < 100) s.health = clamp(s.health + 2);

  const now = Date.now();
  const careCount = pet.careCount + 1; // each care adds warmth toward hatching
  const r = processXp({ ...pet, careCount }, action.xp, s, now);
  return { ...pet, stats: s, xp: r.xp, level: r.level, coins: r.coins, stage: r.stage, careCount, lastUpdated: now };
}

// Touching the companion: a gentle affection + happiness + small XP bump (with level-ups).
export function applyTouch(pet) {
  const s = {
    ...pet.stats,
    affection: clamp(pet.stats.affection + 2),
    happiness: clamp(pet.stats.happiness + 1),
  };
  const now = Date.now();
  const r = processXp(pet, 1, s, now);
  return { ...pet, stats: s, xp: r.xp, level: r.level, coins: r.coins, stage: r.stage, lastUpdated: now };
}

export function xpProgress(pet) {
  const need = xpForLevel(pet.level);
  return { current: pet.xp, need, pct: Math.min(100, (pet.xp / need) * 100) };
}