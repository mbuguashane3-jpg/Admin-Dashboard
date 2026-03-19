const CACHE_NAME = 'prometheus-v6';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/dashboard.css',
  '/executive.html',
  '/sales.html',
  '/auth.html'
];

// Force immediate update
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// NETWORK FIRST STRATEGY
// Always tries to get the latest file from the server.
// If the server is down or you are offline, it uses the cache.
self.addEventListener('fetch', (event) => {
  // Skip cross-origin or non-GET requests for now (like Supabase API)
  if (!event.request.url.startsWith(self.location.origin) || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // If successful, update the cache
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(async () => {
        // If network fails, look in the cache
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Final fallback: return a clean 503 response if it's an API call,
        // or a generic error response to prevent "TypeError: Failed to convert value to 'Response'"
        if (event.request.url.includes('/api/')) {
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Neural Link Offline",
            mode: "VAULT_MODE_ENGAGED" 
          }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          });
        }

        return new Response("Neural Link Offline. Check Connection.", {
          status: 503,
          statusText: "Service Unavailable"
        });
      })
  );
});
