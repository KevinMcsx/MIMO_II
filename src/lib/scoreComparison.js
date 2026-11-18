export const inputLabels = {
  keyboard: 'Keyboard',
  mouse: 'Mouse',
  touch: 'Touchscreen',
  pen: 'Stylus',
  console: 'Console',
  mixed: 'Mixed controls',
  unknown: 'Unrecorded',
};

export function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function recentRounds(scores) {
  return [...scores].sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date)).slice(0, 5);
}

export function roundAccuracy(score) {
  const total = (score.correct_hits ?? 0) + (score.wrong_hits ?? 0);
  return total ? Math.round((score.correct_hits ?? 0) * 100 / total) : null;
}
