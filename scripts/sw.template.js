// Versi diberi cap waktu tiap build, sehingga SW baru terdeteksi di setiap rilis.
const C = 'taman-__V__';
self.addEventListener('install', (e) => e.waitUntil((async () => {
  const c = await caches.open(C);
  const html = await (await fetch('/', { cache: 'reload' })).text();
  const urls = new Set(['/', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']);
  (html.match(/\/_next\/static\/[^"'\\\s)]+/g) || []).forEach((u) => urls.add(u));
  await c.addAll([...urls]);
})()));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => hit || (r.mode === 'navigate' ? caches.match('/') : null) ||
    fetch(r).then((res) => { if (res.ok) { const cp = res.clone(); caches.open(C).then((c) => c.put(r, cp)); } return res; })));
});
