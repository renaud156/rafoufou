// Pause Pilates — service worker (PWA offline shell)
const CACHE_VERSION = 'pause-pilates-v1';
const CORE_ASSETS = [
  './',
  'index.html',
  'about.html',
  'lepilates.html',
  'services.html',
  'tarifs.html',
  'planning.html',
  'faq.html',
  'emploi.html',
  'contact.html',
  '404.html',
  'style.css',
  'manifest.json',
  'assets/js/main.js',
  'assets/img/logo.png',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png',
  'assets/img/icon-maskable-512.png',
  'assets/img/studio-reformer.jpg',
  'assets/img/studio-balls.jpg',
  'assets/img/emilie-portrait.jpg',
  'assets/img/marion-portrait.jpg',
  'assets/img/maria-portrait.jpg',
  'assets/img/diane-cadillac.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(CORE_ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
