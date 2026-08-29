// START/NOW service worker — v131 stable Last Time interaction.
// Network-first plus no-store prevents an older browser HTTP cache from winning.
const CACHE_NAME = 'start-now-shell-v131';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png',
  './assets/pwa/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('start-now-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
      } catch (_) {}
    }
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  event.respondWith((async () => {
    try {
      let response;

      if (request.mode === 'navigate') {
        const preload = await event.preloadResponse;
        response = preload || await fetch(new Request(request, { cache: 'no-store' }));
      } else {
        response = await fetch(new Request(request, { cache: 'no-store' }));
      }

      if (response?.ok && response.status !== 206) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) return cached;

      if (request.mode === 'navigate') {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }

      throw error;
    }
  })());
});
