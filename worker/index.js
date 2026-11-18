import { assets, indexHtml } from './assets.js';

import { gameName } from './gameDefinitions.js';

function formatScore(score) {
  const { id, created_date, player_name, game_type, difficulty } = score;
  const name = gameName(game_type);
  if (!/^[a-f0-9-]{36}$/i.test(id) || typeof player_name !== 'string' ||
      !player_name.trim() || player_name.length > 200 || !Number.isInteger(game_type) ||
      !name || !Number.isInteger(difficulty) || difficulty < 1 || difficulty > 4 ||
      !Number.isFinite(Date.parse(created_date))) return null;
  const metric = (name, fallback = 0) => Number.isFinite(score[name]) ? score[name] : fallback;

  return [
    new Date(created_date).toISOString(), player_name, game_type, name, difficulty,
    metric('score'), metric('avg_reaction_time'), metric('correct_hits'), metric('wrong_hits'),
    metric('correct_shapes', ''), metric('wrong_shapes', ''), metric('total_time'),
  ];
}

async function syncScore(request, env) {
  if (request.method !== 'POST') return new Response(null, { status: 405 });
  if (request.headers.get('Origin') !== new URL(request.url).origin ||
      !request.headers.get('Content-Type')?.startsWith('application/json')) {
    return new Response(null, { status: 403 });
  }
  if (!env.SHEETS_WEBAPP_URL || !env.SHEETS_WRITE_TOKEN) return new Response(null, { status: 503 });

  const body = await request.text();
  if (body.length > 4096) return new Response(null, { status: 413 });
  let score;
  try { score = JSON.parse(body); } catch { return new Response(null, { status: 400 }); }
  const row = score && formatScore(score);
  if (!row) return new Response(null, { status: 422 });

  try {
    const upstream = await fetch(env.SHEETS_WEBAPP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: env.SHEETS_WRITE_TOKEN, id: score.id, row }),
      signal: AbortSignal.timeout(15000),
    });
    if (upstream.ok && (await upstream.json()).ok === true) return new Response(null, { status: 204 });
  } catch {
    // Keep the score queued in the browser after transient failures.
  }
  return new Response(null, { status: 502 });
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    if (path === '/api/sheets/results') return syncScore(request, env);
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405 });
    const asset = assets[path];
    if (asset) {
      return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(asset.data), c => c.charCodeAt(0)), {
        headers: { 'Content-Type': asset.type, 'Cache-Control': path.startsWith('/assets/') ? 'public,max-age=31536000,immutable' : 'public,max-age=3600' },
      });
    }
    if (path.startsWith('/api/') || path.startsWith('/assets/')) return new Response(null, { status: 404 });
    return new Response(request.method === 'HEAD' ? null : indexHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' },
    });
  },
};
