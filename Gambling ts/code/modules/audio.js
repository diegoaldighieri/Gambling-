// ===== SISTEMA SUONI E NOTIFICHE =====

let soundsEnabled = true;

// Crea un beep sintetizzato
function createBeep(frequency, duration, type = 'sine') {
    return () => {
        if (!soundsEnabled) return;
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = frequency;
            oscillator.type = type;
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio not supported');
        }
    };
}

// Suoni del gioco
const sounds = {
    click: createBeep(800, 0.05, 'sine'),
    diamond: createBeep(1200, 0.2, 'sine'),
    bomb: createBeep(100, 0.5, 'sawtooth'),
    win: createBeep(1500, 0.3, 'sine'),
    cashout: createBeep(1000, 0.3, 'triangle'),
    notification: createBeep(900, 0.15, 'sine'),
    levelup: createBeep(1800, 0.4, 'sine')
};

// Riproduci un suono
export function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName]();
    }
}

// Abilita/disabilita suoni
export function setSoundsEnabled(enabled) {
    soundsEnabled = enabled;
}

export function areSoundsEnabled() {
    return soundsEnabled;
}

// Sistema notifiche
export function showNotification(message, type = 'info', duration = 3000) {
    const container = document.getElementById('notifications-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
    `;

    container.appendChild(notification);
    playSound('notification');

    setTimeout(() => notification.classList.add('show'), 10);
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}
