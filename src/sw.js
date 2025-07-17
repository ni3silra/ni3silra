/**
 * Service Worker for Portfolio Application
 * Provides offline functionality and caching strategies
 */

const CACHE_NAME = 'portfolio-v1.0.0';
const STATIC_CACHE = 'portfolio-static-v1.0.0';
const DYNAMIC_CACHE = 'portfolio-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/styles/main.css',
  '/src/js/main.js',
  '/src/js/core/App.js',
  '/src/js/utils/EventEmitter.js',
  '/src/js/utils/StateManager.js',
  '/src/js/utils/ComponentRegistry.js',
  '/src/js/utils/ThemeManager.js',
  '/src/js/utils/LazyLoader.js',
  '/src/js/utils/PerformanceMonitor.js',
  '/src/js/components/Navigation.js',
  '/src/js/components/Hero.js',
  '/src/js/components/Skills.js',
  '/src/js/components/Projects.js',
  '/src/js/components/Experience.js'
];

// Dynamic assets patterns
const DYNAMIC_PATTERNS = [
  /\/src\/js\/components\/Contact\.js$/,
  /\/api\/placeholder\/\d+\/\d+$/,
  /\.webp$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.png$/,
  /\.svg$/
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /github\.com\/api/,
  /api\.github\.com/
];

/**
 * Install event - cache static assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache static assets', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

/**
 * Fetch event - handle requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Determine caching strategy based on request
  if (isNetworkFirst(request.url)) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStaticAsset(request.url)) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isDynamicAsset(request.url)) {
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    event.respondWith(networkFirstStrategy(request));
  }
});

/**
 * Check if URL should use network-first strategy
 */
function isNetworkFirst(url) {
  return NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Check if URL is a static asset
 */
function isStaticAsset(url) {
  return STATIC_ASSETS.some(asset => url.endsWith(asset)) ||
    url.includes('/src/styles/') ||
    url.includes('/src/js/') && !url.includes('Contact.js');
}

/**
 * Check if URL is a dynamic asset
 */
function isDynamicAsset(url) {
  return DYNAMIC_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Cache-first strategy - check cache first, fallback to network
 */
async function cacheFirstStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('Cache-first strategy failed:', error);
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Network-first strategy - try network first, fallback to cache
 */
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Cache successful responses for dynamic content
    if (networkResponse.status === 200 && isDynamicAsset(request.url)) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Stale-while-revalidate strategy - return cache immediately, update in background
 */
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  // Fetch from network in background
  const networkResponsePromise = fetch(request)
    .then(response => {
      if (response.status === 200) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.log('Background fetch failed:', error);
    });

  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }

  // If no cache, wait for network
  try {
    return await networkResponsePromise;
  } catch (error) {
    return new Response('Offline - Resource not available', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Background sync for form submissions
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

/**
 * Sync contact form submissions when back online
 */
async function syncContactForm() {
  try {
    // Get pending form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();

    for (const submission of pendingSubmissions) {
      try {
        // Skip API submission to prevent startup failures
        // In a real implementation, you would submit to your backend API
        console.log('Contact form submission skipped (no backend API configured):', submission.data);

        // Remove from pending submissions to prevent accumulation
        await removePendingSubmission(submission.id);
        console.log('Contact form marked as processed (mock)');

      } catch (error) {
        console.error('Failed to sync contact form:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

/**
 * Get pending form submissions (placeholder - would use IndexedDB)
 */
async function getPendingSubmissions() {
  // In a real implementation, this would read from IndexedDB
  return [];
}

/**
 * Remove pending submission (placeholder - would use IndexedDB)
 */
async function removePendingSubmission(id) {
  // In a real implementation, this would remove from IndexedDB
  console.log('Removing pending submission:', id);
}

/**
 * Push notification handling
 */
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey
    },
    actions: [
      {
        action: 'explore',
        title: 'View Portfolio',
        icon: '/icon-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

/**
 * Message handling for cache updates
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(DYNAMIC_CACHE)
        .then(cache => cache.addAll(event.data.urls))
    );
  }
});

console.log('Service Worker: Loaded');