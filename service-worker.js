const CACHE_VERSION = 'v1.1.0';
const CACHE_NAME = `lumin-os-${CACHE_VERSION}`;
const BASE_URL = self.location.href.slice(0, self.location.href.lastIndexOf('/') + 1);

const APP_SHELL_RESOURCES = [
  'index.html',
  'css/styles.css',
  'js/main.js',
  'js/os-core.js',
  'js/window-manager.js',
  'js/file-system.js',
  'js/apps/notepad.js',
  'js/apps/image-viewer.js',
  'js/apps/music-player.js',
  'js/apps/draw-app.js',
  'js/apps/spreadsheet.js',
  'js/apps/clock.js',
  'js/apps/breakout.js',
  'js/apps/file-manager.js',
  'manifest.webmanifest',
  'assets/icons/lumin-os-icon.svg'
].map(path => new URL(path, BASE_URL).toString());

const OFFLINE_DOCUMENT = new URL('index.html', BASE_URL).toString();

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL_RESOURCES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.error('Service Worker インストールエラー:', error);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return null;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }

        return fetch(event.request).then(networkResponse => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== 'basic'
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
      .catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_DOCUMENT).then(response => response ?? Response.error());
        }
        return Response.error();
      })
  );
});
