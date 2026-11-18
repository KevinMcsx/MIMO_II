const cacheName = 'loopybrain-shell-__BUILD_VERSION__';
const shellAssets = __SHELL_ASSETS__;

self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache =>
    cache.addAll(shellAssets.map(url => new Request(url, { cache: 'reload' })))
  ));
});

self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys
      .filter(key => key.startsWith('loopybrain-shell-') && key !== cacheName)
      .map(key => caches.delete(key)))),
    self.clients.claim(),
  ]));
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  if (request.mode === 'navigate' && !url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(async () =>
      (await (await caches.open(cacheName)).match('/')) ??
      new Response('LoopyBrain is temporarily offline.', { status: 503 })
    ));
  } else if (shellAssets.includes(url.pathname) && url.pathname !== '/') {
    event.respondWith(caches.open(cacheName).then(async cache =>
      (await cache.match(url.pathname)) ?? fetch(request)
    ));
  }
});
