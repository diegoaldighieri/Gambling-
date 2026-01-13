// ===== SERVICE WORKER - CACCIA AL TESORO =====

const CACHE_NAME = 'caccia-tesoro-v4.0';
const RUNTIME_CACHE = 'caccia-tesoro-runtime';

// File da cacheare immediatamente
const CORE_ASSETS = [
    '/',
    '/Gambling.html',
    '/code/main.js',
    '/code/Gambling.js',
    '/styles/style.css',
    '/styles/css_base.css',
    '/styles/css_animations.css',
    '/styles/css_layout.css',
    '/styles/css_grid.css',
    '/styles/css_buttons.css',
    '/styles/css_theme.css',
    '/styles/css_popups.css',
    '/styles/css_achievements.css',
    '/styles/css_level.css',
    '/styles/css_stats.css',
    '/styles/css_tutorial.css',
    '/styles/css_controls.css',
    '/styles/css_info.css',
    '/styles/css_notifications.css',
    '/styles/css_bombs.css',
    '/styles/css_bomb_animations.css',
    '/styles/css_enhancements.css',
    '/styles/css_responsive.css',
    '/images/slot-machine.png',
    '/images/gray-square.png',
    '/images/scuro-square.png',
    '/images/neon-square.png',
    '/images/forest-square.png',
    '/images/tramonto-square.png',
    '/images/oceano-square.png',
    '/images/cyberpunk-square.png',
    '/images/lava-square.png',
    '/images/arctic-square.png',
    '/images/gold-square.png',
    '/images/purple-haze-square.png',
    '/images/matrix-square.png'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('📦 Caching core assets...');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('✅ Service Worker: Installed');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('❌ Cache error:', error);
            })
    );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
    console.log('🚀 Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('🗑️ Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('✅ Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Intercettazione richieste
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Ignora richieste non-GET
    if (request.method !== 'GET') return;

    // Ignora richieste cross-origin non necessarie
    if (url.origin !== location.origin && !url.href.includes('cdnjs.cloudflare.com')) {
        return;
    }

    // Strategia: Cache First per assets, Network First per HTML
    if (request.destination === 'document') {
        event.respondWith(networkFirst(request));
    } else {
        event.respondWith(cacheFirst(request));
    }
});

// Strategia Cache First (per assets statici)
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        
        // Cachea la nuova risorsa se è ok
        if (response.status === 200) {
            const runtimeCache = await caches.open(RUNTIME_CACHE);
            runtimeCache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Fetch failed:', error);
        
        // Prova runtime cache
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        const runtimeCached = await runtimeCache.match(request);
        
        if (runtimeCached) {
            return runtimeCached;
        }

        // Fallback per immagini
        if (request.destination === 'image') {
            return caches.match('/images/slot-machine.png');
        }

        throw error;
    }
}

// Strategia Network First (per HTML)
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        if (response.status === 200) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        console.error('Network failed, trying cache:', error);
        
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Fallback offline page
        return new Response(
            '<html><body><h1>🔌 Offline</h1><p>Connessione non disponibile</p></body></html>',
            { headers: { 'Content-Type': 'text/html' } }
        );
    }
}

// Gestione messaggi
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('⏭️ Skipping waiting...');
        self.skipWaiting();
    }
});

// Background Sync (per salvare dati quando torna online)
self.addEventListener('sync', (event) => {
    console.log('🔄 Background sync:', event.tag);
    
    if (event.tag === 'sync-leaderboard') {
        event.waitUntil(syncLeaderboard());
    }
});

async function syncLeaderboard() {
    try {
        // Implementa logica sincronizzazione leaderboard
        console.log('📊 Syncing leaderboard...');
        
        // Qui andrebbero inviati i punteggi salvati localmente
        // quando l'utente era offline
        
        return Promise.resolve();
    } catch (error) {
        console.error('Sync failed:', error);
        return Promise.reject(error);
    }
}

// Periodic Background Sync (per controllare aggiornamenti)
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'check-updates') {
        event.waitUntil(checkForUpdates());
    }
});

async function checkForUpdates() {
    console.log('🔍 Checking for updates...');
    // Implementa logica controllo aggiornamenti
}

// Push Notifications
self.addEventListener('push', (event) => {
    console.log('📬 Push notification received');
    
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Hai una nuova notifica!',
        icon: '/images/slot-machine.png',
        badge: '/images/slot-machine.png',
        vibrate: [200, 100, 200],
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Caccia al Tesoro', options)
    );
});

// Click su notifica
self.addEventListener('notificationclick', (event) => {
    console.log('🔔 Notification clicked');
    
    event.notification.close();

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((windowClients) => {
                // Cerca finestra già aperta
                for (const client of windowClients) {
                    if (client.url === urlToOpen && 'focus' in client) {
                        return client.focus();
                    }
                }
                
                // Apri nuova finestra
                if (clients.openWindow) {
                    return clients.openWindow(urlToOpen);
                }
            })
    );
});

console.log('✅ Service Worker loaded');
