const SHELL_CACHE = "fyn-shell-v1";
const LAST_ISSUE_CACHE = "fyn-last-issue";
const LAST_ISSUE_URL = "/offline/last-issue";
const PRECACHE = ["/offline", "/manifest.webmanifest", "/pigeon-filled.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (url.pathname === LAST_ISSUE_URL) {
    event.respondWith(caches.open(LAST_ISSUE_CACHE).then((cache) => cache.match(LAST_ISSUE_URL)));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const lastIssue = await caches.open(LAST_ISSUE_CACHE).then((cache) => cache.match(LAST_ISSUE_URL));
        if (lastIssue && url.pathname.includes("/read")) return lastIssue;
        return caches.match("/offline");
      })
    );
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        if (response.ok) {
          void caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
