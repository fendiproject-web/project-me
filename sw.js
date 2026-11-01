const CACHE_NAME = 'fendi-store-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css?v=6',
  'script.js',
  'profile.webp',
  'banner1.png',
  'manifest.json'
];

// PROSES INSTALL & CACHE ASSET UTAMA
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// AKTIVASI & HAPUS CACHE LAMA JIKA ADA UPDATE
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// AMBIL DATA DARI CACHE ATAU NETWORK
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
