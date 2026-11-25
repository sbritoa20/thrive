// Service worker: hace que la app abra sin internet y guarda las fotos de ejercicios.
const SHELL_CACHE = 'thrive-shell-v1';
const IMG_CACHE = 'thrive-img-v1';
const SHELL = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL_CACHE, IMG_CACHE].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Fotos de la biblioteca de ejercicios: primero la copia guardada.
  if (url.hostname === 'raw.githubusercontent.com' && /\.(jpe?g|png|gif|webp)$/i.test(url.pathname)) {
    e.respondWith(
      caches.open(IMG_CACHE).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Archivos de la app: con internet trae la versión más nueva; sin internet usa la guardada.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.open(SHELL_CACHE).then(async (c) => {
        try {
          const res = await fetch(req);
          if (res.ok) c.put(req, res.clone());
          return res;
        } catch {
          return (await c.match(req, { ignoreSearch: true })) || (await c.match('./index.html'));
        }
      })
    );
  }
});
