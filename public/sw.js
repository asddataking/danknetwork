const CACHE_NAME = 'dank-network-v2';
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
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event - serve from cache, fallback to network
// BUT exclude Next.js static assets, map tiles, API routes, and external resources
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip service worker for:
  // 1. Next.js static assets (they have hashes and change on every build)
  // 2. Mapbox tile services
  // 3. API routes
  // 4. External resources (not same origin) - images, fonts, etc.
  // 5. MapLibre GL resources
  const isNextStaticAsset = url.pathname.startsWith('/_next/static/');
  
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
  
  // Skip Next.js build manifest and other build files
  const isNextBuildFile = url.pathname.startsWith('/_next/') || 
                          url.pathname.includes('webpack') ||
                          url.pathname.includes('chunks');
  
  if (isNextStaticAsset || isNextBuildFile || isMapTile || isApiRoute || isExternalResource || isMapLibreResource) {
    // Don't intercept - let these requests go directly to network
    // This ensures we always get the latest Next.js assets after deployment
    return;
  }
  
  // For HTML pages and other non-hashed resources, use network-first strategy
  // This ensures users get fresh content after deployments
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response because it can only be consumed once
        const responseToCache = response.clone();
        
        // Only cache successful GET requests for same-origin resources
        if (event.request.method === 'GET' && 
            url.origin === self.location.origin &&
            response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        
        return response;
      })
      .catch(() => {
        // If network fails, try cache as fallback
        return caches.match(event.request);
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
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

