// Companion collection tracking — which creatures have been adopted and how
// far each has evolved. Persisted to localStorage alongside the active pet.
const KEY = 'heartpets_collection';

export function getCollection() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

// Record the current pet's creature + stage into the collection.
// Returns the updated collection so callers can store it in state.
export function recordCollection(pet) {
  if (!pet || !pet.creatureId) return getCollection();
  const col = getCollection();
  const cur = col[pet.creatureId] || { adopted: false, maxStage: 0 };
  cur.adopted = true;
  cur.maxStage = Math.max(cur.maxStage, pet.stage || 0);
  col[pet.creatureId] = cur;
  localStorage.setItem(KEY, JSON.stringify(col));
  return col;
}