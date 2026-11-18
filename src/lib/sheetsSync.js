import { localData } from '@/api/localData';

let syncing = false;
let retryTimer;

export async function queueSheetResult() {
  if (syncing || !navigator.onLine) return;
  syncing = true;
  clearTimeout(retryTimer);
  try {
    const scores = await localData.entities.GameScore.list('created_date');
    for (const score of scores) {
      if (!score.sheetSyncPending) continue;
      const response = await fetch('/api/sheets/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(score),
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) throw new Error('Could not sync score');
      await localData.entities.GameScore.update(score.id, { sheetSyncPending: false });
    }
  } catch {
    retryTimer = setTimeout(queueSheetResult, 30000);
  } finally {
    syncing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', queueSheetResult);
  retryTimer = setTimeout(queueSheetResult, 0);
  window.setInterval(queueSheetResult, 30000);
}
