// ===== SISTEMA PWA (PROGRESSIVE WEB APP) =====

import { showNotification } from './audio.js';

let deferredPrompt = null;
let isInstalled = false;

// Controlla se app è già installata
export function checkIsInstalled() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        isInstalled = true;
        return true;
    }
    
    if (window.navigator.standalone === true) {
        isInstalled = true;
        return true;
    }
    
    return false;
}

// Setup PWA
export function setupPWA() {
    // Controlla se già installata
    isInstalled = checkIsInstalled();
    
    if (isInstalled) {
        console.log('✅ App già installata');
        nascondiPulsanteInstalla();
        return;
    }

    // Listener per evento beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('📱 PWA installabile rilevata');
        e.preventDefault();
        deferredPrompt = e;
        mostraPulsanteInstalla();
    });

    // Listener per installazione completata
    window.addEventListener('appinstalled', () => {
        console.log('✅ App installata con successo');
        isInstalled = true;
        deferredPrompt = null;
        nascondiPulsanteInstalla();
        showNotification('✅ App installata con successo!', 'success');
    });

    // Registra Service Worker
    if ('serviceWorker' in navigator) {
        registerServiceWorker();
    }
}

// Registra Service Worker
async function registerServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });
        
        console.log('✅ Service Worker registrato:', registration.scope);

        // Controlla aggiornamenti
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    mostraNotificaAggiornamento();
                }
            });
        });

        // Controlla aggiornamenti ogni ora
        setInterval(() => {
            registration.update();
        }, 60 * 60 * 1000);

    } catch (error) {
        console.error('❌ Errore registrazione Service Worker:', error);
    }
}

// Mostra pulsante installa
function mostraPulsanteInstalla() {
    const button = document.getElementById('pwaInstallButton');
    if (button) {
        button.style.display = 'block';
        button.addEventListener('click', installaApp);
    }
}

// Nascondi pulsante installa
function nascondiPulsanteInstalla() {
    const button = document.getElementById('pwaInstallButton');
    if (button) {
        button.style.display = 'none';
    }
}

// Installa app
export async function installaApp() {
    if (!deferredPrompt) {
        showNotification('⚠️ Installazione non disponibile', 'warning');
        return;
    }

    // Mostra prompt installazione
    deferredPrompt.prompt();

    // Attendi scelta utente
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response: ${outcome}`);

    if (outcome === 'accepted') {
        console.log('✅ Utente ha accettato installazione');
    } else {
        console.log('❌ Utente ha rifiutato installazione');
    }

    deferredPrompt = null;
}

// Mostra notifica aggiornamento disponibile
function mostraNotificaAggiornamento() {
    const notification = document.createElement('div');
    notification.className = 'update-notification';
    notification.innerHTML = `
        <div class="update-content">
            <span>🔄 Nuova versione disponibile!</span>
            <button onclick="window.reloadApp()">AGGIORNA</button>
        </div>
    `;
    document.body.appendChild(notification);
}

// Ricarica app con nuova versione
export function reloadApp() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
            registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        });
    }
    window.location.reload();
}

// Esporta per uso globale
window.reloadApp = reloadApp;

// ===== NOTIFICHE PUSH =====

let notificationPermission = 'default';

// Richiedi permessi notifiche
export async function richiediPermessiNotifiche() {
    if (!('Notification' in window)) {
        console.log('❌ Notifiche non supportate');
        return false;
    }

    if (Notification.permission === 'granted') {
        notificationPermission = 'granted';
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        
        if (permission === 'granted') {
            showNotification('✅ Notifiche attivate!', 'success');
            return true;
        }
    }

    return false;
}

// Invia notifica push
export function inviaNotificaPush(titolo, opzioni = {}) {
    if (notificationPermission !== 'granted') return;

    const defaultOptions = {
        icon: '/images/slot-machine.png',
        badge: '/images/slot-machine.png',
        vibrate: [200, 100, 200],
        ...opzioni
    };

    if ('serviceWorker' in navigator && 'Notification' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(titolo, defaultOptions);
        });
    } else {
        new Notification(titolo, defaultOptions);
    }
}

// ===== GESTIONE OFFLINE =====

let isOnline = navigator.onLine;

// Setup detection online/offline
export function setupOfflineDetection() {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Controlla stato iniziale
    if (!isOnline) {
        mostraModalitaOffline();
    }
}

function handleOnline() {
    isOnline = true;
    nascondiModalitaOffline();
    showNotification('✅ Connessione ripristinata!', 'success');
}

function handleOffline() {
    isOnline = false;
    mostraModalitaOffline();
    showNotification('⚠️ Modalità offline attiva', 'warning');
}

function mostraModalitaOffline() {
    let banner = document.getElementById('offlineBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'offlineBanner';
        banner.className = 'offline-banner';
        banner.innerHTML = `
            <span>⚠️ Modalità Offline - Alcune funzionalità potrebbero non essere disponibili</span>
        `;
        document.body.appendChild(banner);
    }
    banner.style.display = 'block';
}

function nascondiModalitaOffline() {
    const banner = document.getElementById('offlineBanner');
    if (banner) {
        banner.style.display = 'none';
    }
}

export function isAppOnline() {
    return isOnline;
}

// ===== ANALYTICS E TRACKING =====

// Traccia eventi app
export function trackEvent(categoria, azione, etichetta, valore) {
    // Per Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', azione, {
            event_category: categoria,
            event_label: etichetta,
            value: valore
        });
    }

    // Log locale per debugging
    console.log('📊 Event:', { categoria, azione, etichetta, valore });
}

// Traccia schermo
export function trackScreen(nomeSchermo) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'screen_view', {
            screen_name: nomeSchermo
        });
    }
    
    console.log('📱 Screen:', nomeSchermo);
}

// ===== GESTIONE DATI LOCALI =====

// Esporta dati per backup
export async function esportaDatiLocali() {
    const dati = {};
    
    // Raccogli tutti i dati da localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
            dati[key] = localStorage.getItem(key);
        }
    }

    // Crea blob e download
    const blob = new Blob([JSON.stringify(dati, null, 2)], { 
        type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caccia-tesoro-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showNotification('💾 Backup completato!', 'success');
}

// Importa dati da backup
export async function importaDatiLocali(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const dati = JSON.parse(e.target.result);
                
                // Conferma prima di sovrascrivere
                const conferma = confirm(
                    'Attenzione: Questo sovrascriverà tutti i dati attuali. Continuare?'
                );
                
                if (!conferma) {
                    reject(new Error('Operazione annullata'));
                    return;
                }

                // Importa dati
                Object.keys(dati).forEach(key => {
                    localStorage.setItem(key, dati[key]);
                });

                showNotification('✅ Dati importati! Ricarica la pagina.', 'success');
                
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                
                resolve();
            } catch (error) {
                showNotification('❌ Errore importazione dati!', 'error');
                reject(error);
            }
        };

        reader.onerror = () => {
            showNotification('❌ Errore lettura file!', 'error');
            reject(reader.error);
        };

        reader.readAsText(file);
    });
}

// ===== CONDIVISIONE =====

// Condividi app
export async function condividiApp() {
    const shareData = {
        title: '💎 Caccia al Tesoro',
        text: 'Sfidami a Caccia al Tesoro! Un gioco di fortuna e strategia 🎮',
        url: window.location.href
    };

    try {
        if (navigator.share) {
            await navigator.share(shareData);
            trackEvent('Social', 'Share', 'App');
        } else {
            // Fallback: copia link
            await navigator.clipboard.writeText(window.location.href);
            showNotification('🔗 Link copiato negli appunti!', 'success');
        }
    } catch (error) {
        console.error('Errore condivisione:', error);
    }
}

// ===== CSS PWA =====

export function aggiungiCSSPWA() {
    const style = document.createElement('style');
    style.textContent = `
        #pwaInstallButton {
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 15px 25px;
            background: var(--color-primary);
            color: var(--color-text-dark);
            border: none;
            border-radius: 50px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            display: none;
            animation: pulse 2s infinite;
        }

        #pwaInstallButton:hover {
            transform: scale(1.05);
        }

        .update-notification {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-primary);
            color: var(--color-text-dark);
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideDown 0.3s ease;
        }

        .update-content {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .update-content button {
            padding: 8px 16px;
            background: var(--color-secondary);
            color: var(--color-text-dark);
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
        }

        .offline-banner {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            background: #ff6600;
            color: white;
            text-align: center;
            padding: 10px;
            z-index: 10000;
            font-weight: bold;
        }

        @keyframes slideDown {
            from {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
            to {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
        }

        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.05);
            }
        }

        @media (max-width: 768px) {
            #pwaInstallButton {
                bottom: 70px;
                right: 10px;
                padding: 12px 20px;
                font-size: 14px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Setup completo PWA
export function inizializzaPWA() {
    aggiungiCSSPWA();
    setupPWA();
    setupOfflineDetection();
    
    // Crea pulsante installa
    const button = document.createElement('button');
    button.id = 'pwaInstallButton';
    button.textContent = '📱 Installa App';
    button.style.display = 'none';
    document.body.appendChild(button);
}

// Esporta stato
export { isInstalled, deferredPrompt };
