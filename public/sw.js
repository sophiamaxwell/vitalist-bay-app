// Vitalist Bay Events - Service Worker
const CACHE_NAME = 'vb-events-v1';
const OFFLINE_URL = '/offline';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache offline page and essential assets
      await cache.addAll(PRECACHE_ASSETS);
      // Force this service worker to become active
      await self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
      // Take control of all pages immediately
      await self.clients.claim();
    })()
  );
});

// Fetch event - network-first with cache fallback strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // Skip API routes - always fetch fresh
  if (url.pathname.startsWith('/api/')) return;

  // Skip auth-related routes
  if (url.pathname.includes('auth') || url.pathname.includes('login')) return;

  // For navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try network first
          const networkResponse = await fetch(request);
          // Cache successful responses
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache, show offline page
          return caches.match(OFFLINE_URL);
        }
      })()
    );
    return;
  }

  // For static assets (images, fonts, CSS, JS)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff|woff2|css|js)$/)
  ) {
    event.respondWith(
      (async () => {
        // Try cache first for static assets
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          // Return cached version, but update cache in background
          fetch(request).then((response) => {
            if (response.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          });
          return cachedResponse;
        }
        // Not in cache, fetch from network
        try {
          const networkResponse = await fetch(request);
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          // Return a placeholder for images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="#1f2937" width="100" height="100"/><text fill="#6b7280" x="50" y="50" text-anchor="middle" dy=".3em" font-size="12">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
          throw error;
        }
      })()
    );
    return;
  }

  // Default: network first with cache fallback
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw error;
      }
    })()
  );
});

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'New notification from Vitalist Bay Events',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    tag: data.tag || 'vb-events-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Vitalist Bay Events', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    (async () => {
      const windowClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          await client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }

      // Open new window if none found
      await self.clients.openWindow(urlToOpen);
    })()
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-registrations') {
    event.waitUntil(syncRegistrations());
  }
});

async function syncRegistrations() {
  // Get pending registrations from IndexedDB and sync them
  // This would be implemented with actual IndexedDB logic
  console.log('Syncing offline registrations...');
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
