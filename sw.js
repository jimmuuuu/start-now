// START/NOW: network-first updates with a complete offline application shell.
const VERSION = 'v200';
const CACHE_NAME = `start-now-shell-${VERSION}`;
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.css",
  "./privacy.html",
  "./support.html",
  "./manifest.webmanifest",
  "./assets/fonts/inter-latin-wght-normal.woff2",
  "./assets/pwa/icon-192.png",
  "./assets/pwa/icon-512.png",
  "./assets/pwa/icon-maskable-512.png",
  "./assets/pwa/apple-touch-icon.png",
  "./third-party/supabase.js",
  "./production-monitor-v88.js",
  "./app.js",
  "./exercise-data.js",
  "./exercise-library-extra.js",
  "./product-core-v36.js",
  "./data-store-v117.js",
  "./routine-data.js",
  "./swap-exercise-v90.js",
  "./exercise-media-manifest-v42.js",
  "./complete-exercise-media-v105.js",
  "./ui.js",
  "./workout.js",
  "./pages.js",
  "./routines.js",
  "./profile.js",
  "./cloud-account-v89.js",
  "./pwa-install-v112.js",
  "./bootstrap.js"
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
      const networkRequest = new Request(request, { cache: 'no-store' });
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
