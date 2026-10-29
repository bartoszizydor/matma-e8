// Praca offline: najpierw sieć (poprawki docierają same), bez internetu pamięć podręczna.
const WERSJA = 'matma-e8-v4';
const PLIKI = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'ikona.svg', 'ikona-192.png', 'ikona-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(WERSJA).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
	caches.keys().then(k => Promise.all(k.filter(n => n !== WERSJA).map(n => caches.delete(n)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
	if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
	e.respondWith(fetch(e.request).then(odp => {
		const kopia = odp.clone();
		caches.open(WERSJA).then(c => c.put(e.request, kopia));
		return odp;
	}).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
