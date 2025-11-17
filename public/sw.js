const CACHE_NAME = 'dank-network-v1';
const urlsToCache = [
  '/',
  '/danknddevour',
  '/recipes',
  '/sports',
  '/saved',
  '/manifest.json',
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - serve from cache, fallback to network
// BUT exclude map tiles, API routes, and external resources
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip service worker for:
  // 1. Mapbox tile services
  // 2. API routes
  // 3. External resources (not same origin) - images, fonts, etc.
  // 4. MapLibre GL resources
  const isMapTile = url.hostname.includes('mapbox.com');
  
  const isApiRoute = url.pathname.startsWith('/api/');
  
  const isExternal = url.origin !== self.location.origin;
  
  const isMapLibreResource = 
    url.pathname.includes('maplibre') ||
    url.pathname.includes('mapbox-gl');
  
  // Skip external images, fonts, and other external resources
  const isExternalResource = isExternal && (
    url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|woff|woff2|ttf|eot)$/i) ||
    url.hostname.includes('unsplash.com') ||
    url.hostname.includes('ytimg.com') ||
    url.hostname.includes('youtube.com')
  );
  
  if (isMapTile || isApiRoute || isExternalResource || isMapLibreResource) {
    // Don't intercept - let these requests go directly to network
    return;
  }
  
  // For same-origin requests, try cache first, then network
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
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
});

