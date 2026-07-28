const STORAGE_KEY = 'loopybrain_game_scores';

export function getAllLocalScores() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function getBestScore(gameId) {
  const scores = getAllLocalScores();
  const gameScores = scores.filter(s => s.game_type === gameId);
  if (gameScores.length === 0) return null;
  return Math.max(...gameScores.map(s => s.score || 0));
}

export function getFirstScore(gameId) {
  const scores = getAllLocalScores()
    .filter(s => s.game_type === gameId)
    .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  return scores.length > 0 ? (scores[0].score || 0) : null;
}

export function getImprovement(gameId) {
  const first = getFirstScore(gameId);
  const best = getBestScore(gameId);
  if (first === null || best === null || first === 0) return 0;
  return Math.round(((best - first) / first) * 100);
}

export function hasPlayed(gameId) {
  return getBestScore(gameId) !== null;
}

export function getPlayCount(gameId) {
  const scores = getAllLocalScores();
  return scores.filter(s => s.game_type === gameId).length;
}

export function getCategoryProgress(gameIds) {
  const played = gameIds.filter(id => hasPlayed(id)).length;
  return {
    played,
    total: gameIds.length,
    percentage: gameIds.length > 0 ? Math.round((played / gameIds.length) * 100) : 0,
  };
}