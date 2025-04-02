const CACHE_VERSION = 'v1.8.0'; // Updated version
const CACHE_NAME = `portfolio-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Ensure core assets needed for the redirect page are cached
const STATIC_ASSETS = [
  '/', // Alias for index.html for root access
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/css/style.css',
  '/css/offline.css',
  '/js/script.js',
  '/js/offline.js'
  // Note: animation.js and three.js (CDN) are NOT cached for offline use
  // as they're non-essential for the core redirect functionality
].map(url => {
    // Basic URL check to avoid adding query string to already versioned URLs if any
    const hasQuery = url.includes('?');
    return hasQuery ? url : url + `?v=${CACHE_VERSION}`;
});

// Cache Strategy Definitions
const CACHE_STRATEGIES = {
    NETWORK_FIRST: 'network-first',
    CACHE_FIRST: 'cache-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log(`[SW] Installing Cache Version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets:', STATIC_ASSETS);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate new SW immediately
      .catch(error => {
        console.error('[SW] Failed to cache assets during install:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log(`[SW] Activating Cache Version: ${CACHE_VERSION}`);
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('portfolio-cache-') && name !== CACHE_NAME)
            .map(name => {
              console.log(`[SW] Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients.');
        return self.clients.claim(); // Take control of open pages
      })
      .catch(error => {
          console.error('[SW] Failed to clean old caches during activate:', error);
      })
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignore non-GET requests and browser extension requests
    if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
        return;
    }

    // Determine strategy based on request type
    let strategy;
    if (request.mode === 'navigate') {
        strategy = CACHE_STRATEGIES.NETWORK_FIRST; // Prioritize network for HTML pages
    } else if (STATIC_ASSETS.some(asset => request.url.endsWith(asset.split('?')[0]))) {
         strategy = CACHE_STRATEGIES.CACHE_FIRST; // Serve core assets from cache first
    } else {
        // Default strategy for other assets (e.g., fonts, maybe API calls if added later)
        strategy = CACHE_STRATEGIES.STALE_WHILE_REVALIDATE;
    }

    switch (strategy) {
        case CACHE_STRATEGIES.NETWORK_FIRST:
            event.respondWith(networkFirst(request));
            break;
        case CACHE_STRATEGIES.CACHE_FIRST:
            event.respondWith(cacheFirst(request));
            break;
        default: // STALE_WHILE_REVALIDATE
            event.respondWith(staleWhileRevalidate(request));
    }
});

// Network First Strategy: Try network, fallback to cache, then offline page for navigations
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        // If response is OK, cache it and return it
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        // If network fails (e.g., offline) or returns an error, try cache
        console.log(`[SW] Network request failed for ${request.url}, trying cache.`);
        return await fromCache(request, true); // true indicates it's okay to fallback to offline page
    } catch (error) {
        // Network totally failed (e.g., offline)
        console.error(`[SW] Network fetch error for ${request.url}:`, error);
        return await fromCache(request, true); // Fallback to cache/offline page
    }
}

// Cache First Strategy: Try cache, fallback to network
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If not in cache, fetch from network (and cache for next time)
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error(`[SW] Network fetch failed for cache-first request ${request.url}:`, error);
        
        // For assets that should always be available, use offline fallback
        if (request.url.includes('/css/') || request.url.includes('/js/')) {
            return await fromCache(OFFLINE_URL);
        }
        
        return new Response("Network error occurred", { 
            status: 500, 
            statusText: "Network Error",
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

// Stale While Revalidate Strategy: Serve from cache immediately, then update cache in background
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);

    const networkFetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.error(`[SW] SWR network fetch failed for ${request.url}:`, error);
        // Return the cached response if network fails completely in the background
        return cachedResponse || new Response("Network error occurred", { 
            status: 500, 
            statusText: "Network Error",
            headers: { 'Content-Type': 'text/plain' }
        });
    });

    // Return cached response immediately if available, otherwise wait for network
    return cachedResponse || networkFetchPromise;
}

// Helper to get from cache, optionally falling back to offline page
async function fromCache(request, fallbackToOffline = false) {
    const cache = await caches.open(CACHE_NAME);
    let cachedResponse;
    
    // Handle both direct request objects and URL strings
    if (typeof request === 'string') {
        cachedResponse = await cache.match(request);
    } else {
        cachedResponse = await cache.match(request);
    }
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If not in cache and it's a navigation request, serve the offline page
    if ((request.mode === 'navigate' || (typeof request === 'string')) && fallbackToOffline) {
        console.log(`[SW] Serving offline page for failed request: ${request.url || request}`);
        return await cache.match(OFFLINE_URL);
    }
    
    // For non-navigation assets not in cache, let the browser handle the error
    console.warn(`[SW] Asset not found in cache and no offline fallback: ${request.url || request}`);
    return new Response("Asset not found in cache", { 
        status: 404, 
        statusText: "Not Found",
        headers: { 'Content-Type': 'text/plain' }
    });
}

// Handle messages from clients (e.g., for skipping waiting)
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message. Skipping waiting.');
    self.skipWaiting();
  }
});