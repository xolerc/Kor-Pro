const CACHE = 'kod-pro-v1';
const URLS = [
  '/Kor-Pro/', '/Kor-Pro/index.html', '/Kor-Pro/style.css',
  '/Kor-Pro/app.js', '/Kor-Pro/manifest.json',
  '/Kor-Pro/icon-192.png', '/Kor-Pro/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => new Response('Offline', {status:503})))
  );
});
