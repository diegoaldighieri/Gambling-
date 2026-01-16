// ===== SISTEMA ANTI-CHEAT COMPLETO =====

/**
 * Sistema anti-cheat per prevenire manipolazioni del gioco
 * Caratteristiche:
 * - Validazione dati con checksum
 * - Protezione contro manipolazione localStorage
 * - Rate limiting e pattern detection
 * - Timing checks per prevenire automazione
 * - Generazione bombe sicura
 */

// ===== CONFIGURAZIONE =====
const ANTI_CHEAT_CONFIG = {
    MAX_BALANCE: 999999999,
    MIN_BALANCE: 0,
    MAX_BET: 100000,
    MIN_BET: 1,
    MAX_BOMBS_3x3: 8,
    MAX_BOMBS_4x4: 15,
    MAX_BOMBS_5x5: 24,
    MIN_CLICK_INTERVAL: 50, // ms tra click
    MAX_WIN_MULTIPLIER: 10000,
    HASH_SALT: 'gambling_v4_2024_secure',
    MAX_CONSECUTIVE_WINS: 25,
    MAX_HOURLY_GAMES: 600,
    MIN_GAME_DURATION: 800, // ms minimo per partita
    VERSION: '1.0.0'
};

// ===== SECURE STORAGE =====
class SecureStorage {
    constructor() {
        this.checksums = new Map();
        this.encryptionKey = this.generateKey();
    }

    // Genera chiave per encryption
    generateKey() {
        const stored = localStorage.getItem('_ak');
        if (stored) return stored;

        const key = Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
        localStorage.setItem('_ak', key);
        return key;
    }

    // Hash sicuro dei dati
    generateHash(data) {
        const str = JSON.stringify(data) + ANTI_CHEAT_CONFIG.HASH_SALT + this.encryptionKey;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(36);
    }

    // Simple XOR encryption
    encrypt(data) {
        const str = JSON.stringify(data);
        let encrypted = '';
        for (let i = 0; i < str.length; i++) {
            const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
            encrypted += String.fromCharCode(str.charCodeAt(i) ^ keyChar);
        }
        return btoa(encrypted);
    }

    decrypt(encrypted) {
        try {
            const str = atob(encrypted);
            let decrypted = '';
            for (let i = 0; i < str.length; i++) {
                const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
                decrypted += String.fromCharCode(str.charCodeAt(i) ^ keyChar);
            }
            return JSON.parse(decrypted);
        } catch (e) {
            return null;
        }
    }

    // Salva con protezione
    setSecure(key, value) {
        try {
            const hash = this.generateHash(value);
            const encrypted = this.encrypt(value);

            const secureData = {
                data: encrypted,
                hash: hash,
                timestamp: Date.now(),
                version: ANTI_CHEAT_CONFIG.VERSION
            };

            localStorage.setItem(key, JSON.stringify(secureData));
            this.checksums.set(key, hash);
            return true;
        } catch (e) {
            console.error('SecureStorage.setSecure error:', e);
            return false;
        }
    }

    // Carica con verifica
    getSecure(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;

            const secureData = JSON.parse(item);

            // Verifica versione
            if (secureData.version !== ANTI_CHEAT_CONFIG.VERSION) {
                console.warn(`Version mismatch for ${key}`);
                return defaultValue;
            }

            const decrypted = this.decrypt(secureData.data);
            if (!decrypted) {
                this.reportCheatAttempt('DECRYPTION_FAILED', key);
                return defaultValue;
            }

            const currentHash = this.generateHash(decrypted);

            // Verifica integrità
            if (currentHash !== secureData.hash) {
                console.warn(`⚠️ Integrity check failed for ${key}`);
                this.reportCheatAttempt('CHECKSUM_MISMATCH', key);
                return defaultValue;
            }

            return decrypted;
        } catch (e) {
            console.error('SecureStorage.getSecure error:', e);
            return defaultValue;
        }
    }

    // Verifica integrità
    verifyIntegrity(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return true;

            const secureData = JSON.parse(item);
            const decrypted = this.decrypt(secureData.data);
            if (!decrypted) return false;

            const currentHash = this.generateHash(decrypted);
            return currentHash === secureData.hash;
        } catch (e) {
            return false;
        }
    }

    // Report tentativi cheat
    reportCheatAttempt(type, details) {
        const attempt = {
            type: type,
            details: details,
            timestamp: Date.now(),
            userAgent: navigator.userAgent
        };

        try {
            const attempts = JSON.parse(localStorage.getItem('_cheat_log') || '[]');
            attempts.push(attempt);

            // Mantieni ultimi 50
            if (attempts.length > 50) {
                attempts.splice(0, attempts.length - 50);
            }

            localStorage.setItem('_cheat_log', JSON.stringify(attempts));
        } catch (e) {
            console.error('Error logging cheat attempt:', e);
        }

        console.warn('🚨 Cheat attempt detected:', type, details);
    }
}

// ===== VALIDATORI =====
class GameValidator {
    static validateBalance(balance) {
        if (typeof balance !== 'number') return false;
        if (isNaN(balance) || !isFinite(balance)) return false;
        if (balance < ANTI_CHEAT_CONFIG.MIN_BALANCE) return false;
        if (balance > ANTI_CHEAT_CONFIG.MAX_BALANCE) return false;
        return true;
    }

    static validateBet(bet, balance) {
        if (typeof bet !== 'number') return false;
        if (isNaN(bet) || !isFinite(bet)) return false;
        if (bet < ANTI_CHEAT_CONFIG.MIN_BET) return false;
        if (bet > ANTI_CHEAT_CONFIG.MAX_BET) return false;
        if (bet > balance) return false;
        return true;
    }

    static validateBombs(bombs, gridSize) {
        if (typeof bombs !== 'number' || !Number.isInteger(bombs)) return false;
        if (bombs < 1) return false;

        const maxBombs = {
            9: ANTI_CHEAT_CONFIG.MAX_BOMBS_3x3,
            16: ANTI_CHEAT_CONFIG.MAX_BOMBS_4x4,
            25: ANTI_CHEAT_CONFIG.MAX_BOMBS_5x5
        };

        return bombs <= (maxBombs[gridSize] || 0);
    }

    static validateWinning(bet, multiplier, winning) {
        if (typeof winning !== 'number' || isNaN(winning) || !isFinite(winning)) return false;

        const expectedWin = Math.floor(bet * multiplier);
        const tolerance = 2;

        if (Math.abs(winning - expectedWin) > tolerance) return false;
        if (multiplier > ANTI_CHEAT_CONFIG.MAX_WIN_MULTIPLIER) return false;

        return true;
    }

    static validateGameState(state) {
        if (!state || typeof state !== 'object') return false;

        const requiredFields = ['versione', 'numBombe', 'totalescommessa', 'trovati', 'bombe', 'cliccata'];
        for (const field of requiredFields) {
            if (!(field in state)) return false;
        }

        if (![1, 2, 3].includes(state.versione)) return false;

        const totaleCelle = state.versione === 1 ? 9 : state.versione === 2 ? 16 : 25;
        if (state.bombe.length !== state.numBombe) return false;
        if (state.cliccata.length !== totaleCelle) return false;

        if (!this.validateBombs(state.numBombe, totaleCelle)) return false;

        for (const bomba of state.bombe) {
            if (bomba < 0 || bomba >= totaleCelle) return false;
        }

        const celleCliccate = state.cliccata.filter(c => c === true).length;
        const celleBombeCliccate = state.cliccata.filter((c, i) => c === true && state.bombe.includes(i)).length;
        const diamantiTrovati = celleCliccate - celleBombeCliccate;

        if (state.trovati !== diamantiTrovati) return false;

        return true;
    }
}

// ===== PATTERN DETECTOR =====
class PatternDetector {
    constructor() {
        this.clickTimes = [];
        this.winStreak = 0;
        this.lossStreak = 0;
        this.gamesThisHour = 0;
        this.hourStartTime = Date.now();
        this.gameStartTimes = [];
    }

    checkClickSpeed() {
        const now = Date.now();
        this.clickTimes.push(now);

        if (this.clickTimes.length > 20) {
            this.clickTimes.shift();
        }

        if (this.clickTimes.length >= 2) {
            const lastInterval = now - this.clickTimes[this.clickTimes.length - 2];
            if (lastInterval < ANTI_CHEAT_CONFIG.MIN_CLICK_INTERVAL) {
                secureStorage.reportCheatAttempt('RAPID_CLICKING', {
                    interval: lastInterval,
                    timestamp: now
                });
                return false;
            }
        }

        // Controlla pattern troppo regolari
        if (this.clickTimes.length >= 5) {
            const intervals = [];
            for (let i = 1; i < this.clickTimes.length; i++) {
                intervals.push(this.clickTimes[i] - this.clickTimes[i - 1]);
            }

            const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;

            // Se varianza troppo bassa = pattern automatico
            if (variance < 10 && avg < 200) {
                secureStorage.reportCheatAttempt('AUTOMATED_PATTERN', {
                    variance: variance,
                    average: avg
                });
            }
        }

        return true;
    }

    checkWinPattern(isWin) {
        if (isWin) {
            this.winStreak++;
            this.lossStreak = 0;

            if (this.winStreak > ANTI_CHEAT_CONFIG.MAX_CONSECUTIVE_WINS) {
                secureStorage.reportCheatAttempt('SUSPICIOUS_WIN_STREAK', {
                    streak: this.winStreak
                });
            }
        } else {
            this.lossStreak++;
            this.winStreak = 0;
        }
    }

    checkGameRate() {
        const now = Date.now();

        if (now - this.hourStartTime > 3600000) {
            this.gamesThisHour = 0;
            this.hourStartTime = now;
        }

        this.gamesThisHour++;

        if (this.gamesThisHour > ANTI_CHEAT_CONFIG.MAX_HOURLY_GAMES) {
            secureStorage.reportCheatAttempt('EXCESSIVE_GAME_RATE', {
                gamesThisHour: this.gamesThisHour
            });
            return false;
        }

        return true;
    }

    checkGameDuration(startTime) {
        const duration = Date.now() - startTime;

        if (duration < ANTI_CHEAT_CONFIG.MIN_GAME_DURATION) {
            secureStorage.reportCheatAttempt('INSTANT_GAME', {
                duration: duration
            });
            return false;
        }

        return true;
    }

    recordGameStart() {
        const now = Date.now();
        this.gameStartTimes.push(now);

        // Mantieni solo ultimi 10
        if (this.gameStartTimes.length > 10) {
            this.gameStartTimes.shift();
        }

        return now;
    }
}

// ===== ISTANZE =====
const secureStorage = new SecureStorage();
const patternDetector = new PatternDetector();

// ===== API PUBBLICA =====
export const AntiCheat = {
    // Inizializza
    initialize() {
        console.log('🛡️ Anti-cheat system v' + ANTI_CHEAT_CONFIG.VERSION + ' initialized');
        this.setupMonitoring();
    },

    // Setup monitoring
    setupMonitoring() {
        const originalSetItem = Storage.prototype.setItem;

        Storage.prototype.setItem = function(key, value) {
            // Blocca modifiche dirette a chiavi protette
            const protectedKeys = ['caramelle', 'statistiche', 'statoGioco', '_achievements'];

            if (protectedKeys.some(pk => key.includes(pk)) && !key.startsWith('_')) {
                console.warn('⚠️ Direct modification blocked:', key);
                secureStorage.reportCheatAttempt('DIRECT_STORAGE_MODIFICATION', { key });
                return; // Blocca modifica
            }

            return originalSetItem.call(this, key, value);
        };
    },

    // Balance
    setBalance(balance) {
        if (!GameValidator.validateBalance(balance)) {
            secureStorage.reportCheatAttempt('INVALID_BALANCE', { balance });
            return false;
        }
        return secureStorage.setSecure('_balance', balance);
    },

    getBalance(defaultValue = 500) {
        const balance = secureStorage.getSecure('_balance', defaultValue);
        if (!GameValidator.validateBalance(balance)) {
            secureStorage.reportCheatAttempt('CORRUPTED_BALANCE', { balance });
            return defaultValue;
        }
        return balance;
    },

    // Validazioni gioco
    validateGameStart(bet, balance, bombs, gridSize) {
        if (!GameValidator.validateBet(bet, balance)) {
            secureStorage.reportCheatAttempt('INVALID_BET', { bet, balance });
            return false;
        }

        if (!GameValidator.validateBombs(bombs, gridSize)) {
            secureStorage.reportCheatAttempt('INVALID_BOMBS', { bombs, gridSize });
            return false;
        }

        if (!patternDetector.checkGameRate()) {
            return false;
        }

        return patternDetector.recordGameStart();
    },

    validateClick() {
        return patternDetector.checkClickSpeed();
    },

    validateGameEnd(bet, multiplier, winning, isWin, startTime) {
        if (!GameValidator.validateWinning(bet, multiplier, winning)) {
            secureStorage.reportCheatAttempt('INVALID_WINNING', { bet, multiplier, winning });
            return false;
        }

        if (!patternDetector.checkGameDuration(startTime)) {
            return false;
        }

        patternDetector.checkWinPattern(isWin);
        return true;
    },

    // Stato gioco
    validateGameState(state) {
        return GameValidator.validateGameState(state);
    },

    saveGameState(state) {
        if (!this.validateGameState(state)) {
            return false;
        }
        return secureStorage.setSecure('_gameState', state);
    },

    loadGameState() {
        const state = secureStorage.getSecure('_gameState', null);
        if (state && !this.validateGameState(state)) {
            secureStorage.reportCheatAttempt('CORRUPTED_GAME_STATE', state);
            return null;
        }
        return state;
    },

    clearGameState() {
        localStorage.removeItem('_gameState');
    },

    // Statistiche
    saveStats(stats) {
        return secureStorage.setSecure('_stats', stats);
    },

    loadStats(defaultValue) {
        return secureStorage.getSecure('_stats', defaultValue);
    },

    // Achievements
    saveAchievements(achievements) {
        return secureStorage.setSecure('_achievements', achievements);
    },

    loadAchievements(defaultValue = []) {
        return secureStorage.getSecure('_achievements', defaultValue);
    },

    // Generazione bombe sicura
    generateSecureBombs(totalCells, numBombs) {
        if (!GameValidator.validateBombs(numBombs, totalCells)) {
            console.error('Invalid bomb count');
            return [];
        }

        const bombs = new Set();
        const maxAttempts = totalCells * 10;
        let attempts = 0;

        while (bombs.size < numBombs && attempts < maxAttempts) {
            const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] / (0xffffffff + 1);
            const index = Math.floor(randomValue * totalCells);
            bombs.add(index);
            attempts++;
        }

        if (bombs.size < numBombs) {
            secureStorage.reportCheatAttempt('BOMB_GENERATION_FAILED', { numBombs, generated: bombs.size });
            return [];
        }

        return Array.from(bombs);
    },

    // Verifica integrità
    verifyIntegrity() {
        const keys = ['_balance', '_stats', '_gameState', '_achievements'];
        return keys.every(key => secureStorage.verifyIntegrity(key));
    },

    // Report
    getCheatAttempts() {
        try {
            return JSON.parse(localStorage.getItem('_cheat_log') || '[]');
        } catch (e) {
            return [];
        }
    },

    clearCheatLog() {
        localStorage.removeItem('_cheat_log');
    },

    // Emergency reset
    emergencyReset() {
        if (confirm('⚠️ ATTENZIONE: Questa azione cancellerà tutti i dati. Continuare?')) {
            localStorage.clear();
            window.location.reload();
        }
    },

    // Debug info
    getDebugInfo() {
        return {
            version: ANTI_CHEAT_CONFIG.VERSION,
            cheatAttempts: this.getCheatAttempts().length,
            integrityCheck: this.verifyIntegrity(),
            protectedKeys: ['_balance', '_stats', '_gameState', '_achievements']
        };
    }
};

// Auto-inizializzazione
if (typeof window !== 'undefined') {
    window.AntiCheat = AntiCheat;

    // Console helper
    window.showAntiCheatInfo = () => {
        console.group('🛡️ Anti-Cheat System Info');
        console.log(AntiCheat.getDebugInfo());
        const attempts = AntiCheat.getCheatAttempts();
        if (attempts.length > 0) {
            console.log('Recent attempts:', attempts.slice(-5));
        }
        console.groupEnd();
    };
}

// Export validatori
export { GameValidator, PatternDetector, secureStorage };
