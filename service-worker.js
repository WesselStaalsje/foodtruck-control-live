const CACHE_NAME = "vishandel-de-beer-dev-no-cache-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", () => {
  // Geen cache tijdens ontwikkeling. Vercel levert altijd de nieuwste bestanden.
});
