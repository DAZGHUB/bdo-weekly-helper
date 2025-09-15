const APP_VERSION = 'v1.0.1';
const CACHE_NAME = `bdo-weekly-tracker-${APP_VERSION}`;
const urlsToCache = [
    './', './index.html', './style.css', './manifest.json',
    './images/icons/icon-192x192.png', './images/icons/icon-512x512.png',
    './js/app.js', './js/data.js', './js/ui.js', './js/state.js',
    './js/modal.js', './js/tryhardState.js', './js/tryhardUI.js',
    './js/market.js', './js/blackShrineData.js', './js/blackShrineUI.js',
    './js/blackShrineLogic.js', './js/debug.js', './js/fishTracker.js',
    './js/premium.js', './js/sha256.js'
];  

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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
        caches.match(event.request).then(response => response || fetch(event.request))
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage(APP_VERSION);
    }
});