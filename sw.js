const CACHE_NAME = 'portfolio-redirect-v1';
const OFFLINE_URL = 'offline.html';
const BASE_PATH = '/portfolio/'; // GitHub Pages base path

// Assets to cache immediately on service worker install
const PRECACHE_ASSETS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'offline.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'css/style.css',
  BASE_PATH + 'css/offline.css',
  BASE_PATH + 'js/script.js',
  BASE_PATH + 'js/animation.js',
  BASE_PATH + 'js/offline.js',
  BASE_PATH + 'img/favicon.svg',
  BASE_PATH + 'img/favicon.ico',
  BASE_PATH + 'img/apple-touch-icon.png'
];

// Install event - precache key assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service worker pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        // Activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service worker: clearing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Ensure the service worker takes control of all clients
      return self.clients.claim();
    })
  );
});

// Helper function to normalize URLs for GitHub Pages
function normalizeUrl(url) {
  const urlObj = new URL(url);
  // Handle both local development and GitHub Pages paths
  if (urlObj.pathname.startsWith(BASE_PATH) || urlObj.pathname === '/') {
    return url;
  }
  // For GitHub Pages, ensure paths have the correct base
  if (urlObj.origin === self.location.origin && !urlObj.pathname.startsWith(BASE_PATH)) {
    return urlObj.origin + BASE_PATH + urlObj.pathname.replace(/^\//, '');
  }
  return url;
}

// Fetch event - respond with cached content when possible
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    const normalizedUrl = normalizeUrl(event.request.url);
    
    event.respondWith(
      caches.match(normalizedUrl)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            return cachedResponse;
          }

          // Otherwise make network request
          return fetch(event.request)
            .then(response => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response as it can only be consumed once
              const responseToCache = response.clone();

              // Cache the network response for future use
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            })
            .catch(error => {
              console.log('Fetch failed; returning offline page instead.', error);
              
              // If the request is for a page, show the offline page
              if (event.request.mode === 'navigate') {
                return caches.match(BASE_PATH + OFFLINE_URL);
              }
              
              // For image requests, return a placeholder or alternative
              if (event.request.destination === 'image') {
                return new Response(
                  '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f8f9fa"/><text x="50%" y="50%" font-family="sans-serif" font-size="12" text-anchor="middle" dominant-baseline="middle" fill="#a0aec0">Image</text></svg>',
                  { headers: {'Content-Type': 'image/svg+xml'} }
                );
              }
              
              // Return an empty response for other asset types
              return new Response('', { 
                status: 408,
                headers: {'Content-Type': 'text/plain'} 
              });
            });
        })
    );
  }
});

// Handle messages from clients
self.addEventListener('message', event => {
  // Skip waiting if client sends skipWaiting message
  if (event.data === 'skipWaiting') {
    self.skipWaiting().then(() => {
      return self.clients.claim();
    });
  }
});