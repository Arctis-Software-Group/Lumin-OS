const CACHE_NAME = 'lumin-os-v1.0.0';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/os-core.js',
  '/js/window-manager.js',
  '/js/file-system.js',
  '/js/apps/notepad.js',
  '/js/apps/image-viewer.js',
  '/js/apps/music-player.js',
  '/js/apps/draw-app.js',
  '/js/apps/spreadsheet.js',
  '/js/apps/clock.js',
  '/js/apps/breakout.js',
  '/js/apps/file-manager.js',
  '/manifest.webmanifest',
  '/assets/icons/lumin-os-icon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Service Worker インストールエラー:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        });
      })
      .catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
