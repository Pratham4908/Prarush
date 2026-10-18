// Prarush Progressive Web App (PWA) Service Worker
// Version: 2.1.0 (Network-First HTML navigation to prevent stale JS bundle 404s on redeployments)
const SW_VERSION = 'v2.1.0';
const CACHE_NAME = `prarush-cache-${SW_VERSION}`;
const MAP_TILES_CACHE = 'prarush-map-tiles';
const PRESERVED_CACHES = new Set([CACHE_NAME, MAP_TILES_CACHE]);

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
  '/presentation.html',
  '/privacy.html',
  '/terms.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (!PRESERVED_CACHES.has(key)) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // 1. Network-first strategy for HTML navigation and page requests
  // Ensures returning users always receive the latest index.html with valid JS chunk hashes,
  // falling back to cached shell only when completely offline.
  const isHtmlNavigation = request.mode === 'navigate' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');

  if (isHtmlNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, serve cached version or index.html shell
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Cache-first for OpenStreetMap and CartoDB map tiles
  if (url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('cartocdn.com')) {
    event.respondWith(
      caches.open(MAP_TILES_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => cachedResponse);
        });
      })
    );
    return;
  }

  // 3. Stale-while-revalidate for static assets (images, icons, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
