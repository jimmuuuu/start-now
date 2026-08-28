// START/NOW service worker — v111 fresh-build delivery.
// Network first, cache fallback. Navigations bypass the browser HTTP cache so a
// newly deployed index.html is picked up promptly instead of showing an older UI.
const CACHE_NAME = 'start-now-shell-v111';
const SHELL = ['./', './index.html', './manifest.webmanifest'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      const networkRequest = request.mode === 'navigate'
        ? new Request(request, { cache: 'no-store' })
        : request;
      const response = await fetch(networkRequest);
      if (response && response.ok) {
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
