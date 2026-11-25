/* Nadiya Product Manager – service worker.
   Hakee sovelluksen tiedostot aina ensin verkosta, joten uusi versio tulee käyttöön
   heti seuraavalla avauskerralla. Välimuistia käytetään vain, jos verkko ei toimi.
   Microsoftin kirjautumiseen ja OneDriveen meneviin pyyntöihin ei kosketa. */
const CACHE = "nadiya-pm-v2";
const SHELL = [
  "./", "index.html", "app.css", "app.js", "config.js", "i18n.js",
  "lib/msal-browser.min.js", "manifest.webmanifest",
  "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  const scope = new URL(self.registration.scope);
  if (req.method !== "GET" || url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  if (url.pathname.endsWith("redirect.html")) return;   // kirjautumisen paluusivu aina suoraan verkosta

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("index.html")))
  );
});
