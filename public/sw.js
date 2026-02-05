const CACHE_NAME = "habit-tracker-v1";
const STATIC_CACHE = "habit-tracker-static-v1";
const DYNAMIC_CACHE = "habit-tracker-dynamic-v1";

// Static assets to cache on install
const STATIC_ASSETS = [
  "/",
  "/habits",
  "/calendar",
  "/stats",
  "/settings",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Removing old cache:", key);
            return caches.delete(key);
          }),
      );
    }),
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip Supabase API calls - always fetch fresh
  if (url.hostname.includes("supabase")) return;

  // Skip Chrome extension requests
  if (url.protocol === "chrome-extension:") return;

  // For navigation requests (pages), try network first, then cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the new response
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If offline, serve from cache
          return caches.match(request).then((cached) => {
            return cached || caches.match("/");
          });
        }),
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached response and update cache in background
        fetch(request)
          .then((response) => {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, response);
            });
          })
          .catch(() => {});
        return cached;
      }

      // Not in cache - fetch from network
      return fetch(request)
        .then((response) => {
          // Cache the response for future
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return offline fallback for images
          if (request.destination === "image") {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#f0f0f0" width="100" height="100"/><text fill="#999" font-size="14" x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>',
              { headers: { "Content-Type": "image/svg+xml" } },
            );
          }
        });
    }),
  );
});

// Background sync for offline completions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync triggered:", event.tag);
  if (event.tag === "sync-completions") {
    event.waitUntil(syncCompletions());
  }
});

async function syncCompletions() {
  // Get pending completions from IndexedDB and sync to Supabase
  // This will be implemented when IndexedDB storage is set up
  console.log("[SW] Syncing pending completions...");
}

// Push notifications
self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received");

  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "Time to check your habits!",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Open App" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Habit Tracker", options),
  );
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked");
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      }),
  );
});
