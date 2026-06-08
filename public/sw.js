// Service Worker
// Handles offline caching and background sync

const CACHE_NAME = 'fixswift-v1';
const urlsToCache = [
  '/',
  '/offline.html',
  '/globals.css',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-site requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(request)
        .then((response) => {
          // Don't cache non-200 responses
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Return offline page if available
          return caches.match('/offline.html');
        });
    })
  );
});

// Background sync for API calls (when online)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-jobs') {
    event.waitUntil(syncJobs());
  }
});

async function syncJobs() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    // Find pending job requests and retry them
    for (const request of requests) {
      if (request.url.includes('/api/jobs')) {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Periodic background sync (when supported)
if ('periodicSync' in self.registration) {
  self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'update-data') {
      event.waitUntil(updateData());
    }
  });
}

async function updateData() {
  try {
    // Update critical data periodically
    const response = await fetch('/api/jobs');
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put('/api/jobs', response.clone());
    }
  } catch (error) {
    console.error('Update failed:', error);
  }
}
