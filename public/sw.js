const CACHE_NAME = 'my-site-cache-v1';
const urlsToCache = [
  '/',
  '/profile',
  '/styles.css',
  '/index.js',
  '/sw.js',
];

self.addEventListener('install', (event) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      }),
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          console.log('cache hit', response.url);
          return response;
        }
        return fetch(event.request);
      }),
  );
});
