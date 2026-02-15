// Service Worker for ODOJ PWA
const CACHE_NAME = 'odoj-v1';
const STATIC_ASSETS = [
    '/',
    '/login',
    '/signup',
    '/favicon.png',
    '/manifest.json',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Network-first for API/dynamic, cache-first for static
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Skip caching for Supabase API calls and external APIs
    if (url.hostname !== self.location.hostname) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses for static assets
                if (response.ok && (url.pathname.startsWith('/icons/') || url.pathname === '/favicon.png')) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
