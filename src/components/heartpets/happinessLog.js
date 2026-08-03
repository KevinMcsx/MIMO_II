// Happiness trend logging for HeartPets — persisted to localStorage, capped to 7 days.
const LOG_KEY = 'heartpets_happiness_log';
const MAX_AGE = 7 * 24 * 3600 * 1000; // one week
const MAX_POINTS = 600;

export function getHappinessLog() {
  try {
    const raw = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    const cutoff = Date.now() - MAX_AGE;
    return raw.filter((p) => p.t >= cutoff);
  } catch {
    return [];
  }
}

// Append a happiness sample (optionally tagged with the event that caused it).
// Returns the trimmed log so callers can store it in state.
export function recordHappiness(pet, event = null) {
  if (!pet || !pet.stats) return getHappinessLog();
  const log = getHappinessLog();
  log.push({ t: Date.now(), happiness: Math.round(pet.stats.happiness ?? 0), event });
  const cutoff = Date.now() - MAX_AGE;
  const trimmed = log.filter((p) => p.t >= cutoff).slice(-MAX_POINTS);
  localStorage.setItem(LOG_KEY, JSON.stringify(trimmed));
  return trimmed;
}