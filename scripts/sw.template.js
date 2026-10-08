// Build script mengisi versi dan daftar aset hasil Vite.
const C = 'taman-__V__';
const PRECACHE = __PRECACHE__;
self.addEventListener('install', (e) => e.waitUntil(caches.open(C).then((cache) => cache.addAll(PRECACHE))));
self.addEventListener('activate', (e) => e.waitUntil(caches.keys()
  .then((keys) => Promise.all(keys.filter((key) => key.startsWith('taman-') && key !== C).map((key) => caches.delete(key))))
  .then(() => clients.claim())));
self.addEventListener('message', (e) => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).catch(async () => (await caches.match('/index.html')) || Response.error()));
    return;
  }
  e.respondWith(caches.match(r, { ignoreSearch: true }).then(async (hit) => {
    if (hit) {
      const range = r.headers.get('range')?.match(/^bytes=(\d+)-(\d*)$/);
      if (!range) return hit;
      const data = await hit.arrayBuffer();
      const start = Number(range[1]), end = range[2] ? Math.min(Number(range[2]), data.byteLength - 1) : data.byteLength - 1;
      if (start >= data.byteLength || end < start) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${data.byteLength}` } });
      return new Response(data.slice(start, end + 1), { status: 206, headers: {
        'Content-Type': hit.headers.get('Content-Type') || 'application/octet-stream',
        'Content-Range': `bytes ${start}-${end}/${data.byteLength}`,
        'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes',
      } });
    }
    return fetch(r).then((res) => {
      if (res.ok && res.status === 200) { const copy = res.clone(); caches.open(C).then((cache) => cache.put(r, copy)); }
      return res;
    });
  }));
});
