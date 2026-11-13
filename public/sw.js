/* ALIFLY offline shell. Bump the cache version when changing this file. */
const CACHE_NAME = "alifly-shell-v3";
const APP_BASE = new URL("./", self.location.href).pathname;
const APP_SHELL = [
  APP_BASE,
  `${APP_BASE}manifest.webmanifest`,
  `${APP_BASE}icon.svg`,
  `${APP_BASE}apple-touch-icon.png`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("alifly-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_BASE)) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(APP_BASE, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(APP_BASE);
          return cached || new Response("Нет подключения к интернету. Открой ALIFLY позже.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          });
        })
    );
    return;
  }

  // Cache-first is suitable for Vite's versioned assets and app icons.
  if (
    url.pathname.includes("/assets/") ||
    url.pathname.endsWith("icon.svg") ||
    url.pathname.endsWith("apple-touch-icon.png") ||
    url.pathname.endsWith("manifest.webmanifest")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
