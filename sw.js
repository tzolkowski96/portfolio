const CACHE_VERSION = 'v1.3.0';
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/offline.html',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;800&display=swap'
].map(url => url + `?v=${CACHE_VERSION}`);

// Enhanced Cache Strategy
const CACHE_STRATEGIES = {
    NETWORK_FIRST: 'network-first',
    CACHE_FIRST: 'cache-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('portfolio-cache-') && name !== CACHE_NAME)
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
    const strategy = determineCacheStrategy(event.request);
    
    switch (strategy) {
        case CACHE_STRATEGIES.NETWORK_FIRST:
            event.respondWith(networkFirst(event.request));
            break;
        case CACHE_STRATEGIES.CACHE_FIRST:
            event.respondWith(cacheFirst(event.request));
            break;
        default:
            event.respondWith(staleWhileRevalidate(event.request));
    }
});

function determineCacheStrategy(request) {
    if (request.mode === 'navigate') return CACHE_STRATEGIES.NETWORK_FIRST;
    if (request.url.includes('/api/')) return CACHE_STRATEGIES.NETWORK_FIRST;
    if (STATIC_ASSETS.includes(request.url)) return CACHE_STRATEGIES.CACHE_FIRST;
    return CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
}

// Handle service worker updates
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Implement networkFirst, cacheFirst, and staleWhileRevalidate functions
async function networkFirst(request) {
    const MAX_RETRIES = 3;
    let retries = 0;

    while (retries < MAX_RETRIES) {
        try {
            const response = await fetch(request);
            if (response.ok) {
                const cache = await caches.open(CACHE_NAME);
                cache.put(request, response.clone());
                return response;
            }
        } catch (error) {
            console.error(`Fetch attempt ${retries + 1} failed:`, error);
            retries++;
        }
    }

    // All retries failed, try cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    return cachedResponse || cache.match(OFFLINE_URL);
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    return cachedResponse || fetch(request);
}

async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            const clone = response.clone();
            cache.put(request, clone);
        }
        return response;
    });
    return cachedResponse || networkResponsePromise;
}