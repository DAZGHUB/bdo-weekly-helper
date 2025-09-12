const CACHE_NAME = 'bdo-weekly-tracker-v10'; // Bumped version name
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './js/app.js',
    './js/data.js',
    './js/ui.js',
    './js/state.js',
    './js/modal.js',
    './js/tryhardState.js',
    './js/tryhardUI.js',
    './js/market.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache and caching assets');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            }
        )
    );
});

// Optional: Add a script to clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});