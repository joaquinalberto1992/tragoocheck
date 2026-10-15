const CACHE_NAME = 'tragoo-check-v2';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (
    url.includes('/api/') ||
    url.endsWith('.mp4') ||
    url.includes('.mp4?') ||
    event.request.headers.has('range')
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
