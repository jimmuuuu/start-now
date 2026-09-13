// START/NOW service worker — v141 cache and iOS PWA refresh hardening.
const VERSION = 'v141';
const CACHE_NAME = `start-now-shell-${VERSION}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/icon-maskable-512.png',
  './assets/pwa/apple-touch-icon.png'
];

async function cacheFreshShell() {
  const cache = await caches.open(CACHE_NAME);
  await Promise.all(APP_SHELL.map(async path => {
    try {
      const request = new Request(path, { cache: 'reload' });
      const response = await fetch(request);
      if (response?.ok) await cache.put(path, response.clone());
    } catch (_) {
      // Installation should still complete if one optional shell asset is offline.
    }
  }));
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    await cacheFreshShell();
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('start-now-shell-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    // Navigation preload can return an older HTTP-cached index before our
    // explicit no-store request runs. Disable it so every online launch checks
    // the network for the current app shell first.
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.disable();
      } catch (_) {}
    }

    await self.clients.claim();

    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clients.forEach(client => client.postMessage({ type: 'START_NOW_SW_ACTIVATED', version: VERSION }));
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
      const networkRequest = new Request(request, {
        cache: request.mode === 'navigate' ? 'reload' : 'no-store'
      });
      const response = await fetch(networkRequest);

      if (response?.ok && response.status !== 206) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, response.clone()).catch(() => {});
      }

      return response;
    } catch (error) {
      const cached = await caches.match(request, { ignoreSearch: false });
      if (cached) return cached;

      if (request.mode === 'navigate') {
        return (await caches.match('./index.html')) || (await caches.match('./'));
      }

      throw error;
    }
  })());
});
