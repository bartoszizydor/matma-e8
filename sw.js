// Praca offline: najpierw sieć (poprawki docierają same), bez internetu pamięć podręczna.
const WERSJA = 'matma-e8-v8';
const PLIKI = ['./', 'index.html', 'style.css', 'manifest.webmanifest', 'ikona.svg', 'ikona-192.png', 'ikona-512.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(WERSJA).then(c => c.addAll(PLIKI)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(
	caches.keys().then(k => Promise.all(k.filter(n => n !== WERSJA).map(n => caches.delete(n)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', e => {
	// Biblioteki lektora mają przypiętą wersję, więc wystarczy pobrać je raz (potem lektor działa bez internetu). Model głosu trzyma sama biblioteka.
	if (e.request.method === 'GET' && /^https:\/\/(esm\.sh|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net)\//.test(e.request.url)) {
		return e.respondWith(caches.match(e.request).then(z => z || fetch(e.request).then(odp => {
			if (odp.ok) { const kopia = odp.clone(); caches.open(WERSJA).then(c => c.put(e.request, kopia)); }
			return odp;
		})));
	}
	if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) return;
	e.respondWith(fetch(e.request).then(odp => {
		const kopia = odp.clone();
		caches.open(WERSJA).then(c => c.put(e.request, kopia));
		return odp;
	}).catch(() => caches.match(e.request, { ignoreSearch: true })));
});
