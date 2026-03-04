const CACHE_NAME = 'prometheus-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/dashboard.css',
  '/executive.html',
  '/sales.html'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching essential assets...');
      return cache.addAll(ASSETS);
    })
  );
});

// Fetch Assets from Cache (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
