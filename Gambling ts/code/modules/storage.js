// ===== GESTIONE STORAGE CON ANTI-CHEAT =====

import { AntiCheat } from './antiCheat.js';

// Sistema storage con gestione errori e backwards compatibility
export const storage = {
    get(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error('Error loading:', key, e);
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error saving:', key, e);
            return false;
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing:', key, e);
            return false;
        }
    }
};

// ===== BALANCE CON ANTI-CHEAT =====
export function salvaCaramelle(n) {
    // Salva sia nel vecchio formato che nel nuovo
    storage.set('caramelle', n);
    AntiCheat.setBalance(n);
}

export function caricaCaramelle() {
    // Prova prima storage sicuro, poi fallback
    const secureBalance = AntiCheat.getBalance(null);
    if (secureBalance !== null) {
        return secureBalance;
    }
    return storage.get('caramelle', 500);
}

// ===== TEMI =====
export function salvaTema(tema) {
    storage.set('tema', tema);
}

export function caricaTema() {
    return storage.get('tema', 'default');
}

// ===== SCOMMESSA E BOMBE =====
export function salvaUltimaScommessa(scommessa) {
    storage.set('ultimaScommessa', scommessa);
}

export function caricaUltimaScommessa() {
    return storage.get('ultimaScommessa', 0);
}

export function salvaUltimaBombeCount(count) {
    storage.set('ultimeBombe', count);
}

export function caricaUltimaBombeCount() {
    return storage.get('ultimeBombe', 1);
}

export function salvaUltimaVersione(ver) {
    storage.set('ultimaVersione', ver);
}

export function caricaUltimaVersione() {
    return storage.get('ultimaVersione', 0);
}

// ===== STATISTICHE CON ANTI-CHEAT =====
export function caricaStatistiche() {
    // Prova prima storage sicuro
    const secureStats = AntiCheat.loadStats(null);
    if (secureStats) {
        return secureStats;
    }

    // Fallback a vecchio storage
    const oldStats = storage.get('statistiche', {
        partiteGiocate: 0,
        partiteVinte: 0,
        partitePerse: 0,
        totaleScommesso: 0,
        totaleVinto: 0,
        ultimaVincita: 0,
        vincitaMassima: 0,
        perditaMassima: 0
    });

    // Migra a storage sicuro
    if (oldStats.partiteGiocate > 0) {
        AntiCheat.saveStats(oldStats);
    }

    return oldStats;
}

export function salvaStatistiche(stats) {
    // Salva in entrambi i formati
    storage.set('statistiche', stats);
    AntiCheat.saveStats(stats);
}

// ===== ACHIEVEMENTS CON ANTI-CHEAT =====
export function caricaAchievements() {
    // Prova storage sicuro
    const secureAch = AntiCheat.loadAchievements(null);
    if (secureAch) {
        return secureAch;
    }

    // Fallback
    const oldAch = storage.get('achievements', []);
    if (oldAch.length > 0) {
        AntiCheat.saveAchievements(oldAch);
    }

    return oldAch;
}

export function salvaAchievements(unlockedAchievements) {
    storage.set('achievements', unlockedAchievements);
    AntiCheat.saveAchievements(unlockedAchievements);
}

// ===== STATO GIOCO CON ANTI-CHEAT =====
export function salvaStatoGioco(stato) {
    // Aggiungi timestamp
    const statoConTimestamp = {
        ...stato,
        savedAt: Date.now()
    };

    storage.set("statoGioco", statoConTimestamp);
    AntiCheat.saveGameState(statoConTimestamp);
}

export function caricaStatoGioco() {
    // Prova storage sicuro
    const secureState = AntiCheat.loadGameState();
    if (secureState) {
        return secureState;
    }

    // Fallback
    return storage.get("statoGioco", null);
}

export function resetStatoGioco() {
    storage.remove("statoGioco");
    AntiCheat.clearGameState();
}

// ===== STREAK =====
export function getStreak() {
    return storage.get('currentStreak', 0);
}

export function setStreak(streak) {
    storage.set('currentStreak', streak);
}

// ===== LIVELLO =====
export function getLastKnownLevel() {
    return storage.get('lastKnownLevel', 1);
}

export function setLastKnownLevel(level) {
    storage.set('lastKnownLevel', level);
}

// ===== DAILY BONUS =====
export function getLastLogin() {
    return storage.get('lastLogin', '');
}

export function setLastLogin(date) {
    storage.set('lastLogin', date);
}

// ===== TUTORIAL =====
export function isTutorialCompleted() {
    return storage.get('tutorialCompleted', false);
}

export function setTutorialCompleted(completed) {
    storage.set('tutorialCompleted', completed);
}

// ===== VERIFICA INTEGRITÀ =====
export function verificaIntegritaDati() {
    const isValid = AntiCheat.verifyIntegrity();
    if (!isValid) {
        console.warn('⚠️ Data integrity check failed');
    }
    return isValid;
}

// ===== MIGRAZIONE DATI =====
export function migraDatiASicuro() {
    console.log('🔄 Migrating data to secure storage...');

    try {
        // Migra balance
        const balance = storage.get('caramelle', null);
        if (balance !== null) {
            AntiCheat.setBalance(balance);
        }

        // Migra stats
        const stats = storage.get('statistiche', null);
        if (stats) {
            AntiCheat.saveStats(stats);
        }

        // Migra achievements
        const ach = storage.get('achievements', null);
        if (ach) {
            AntiCheat.saveAchievements(ach);
        }

        // Migra game state
        const state = storage.get('statoGioco', null);
        if (state) {
            AntiCheat.saveGameState(state);
        }

        console.log('✅ Data migration completed');
        return true;
    } catch (e) {
        console.error('❌ Migration failed:', e);
        return false;
    }
}

// Auto-migrazione al primo caricamento
if (typeof window !== 'undefined') {
    // Esegui migrazione solo se necessario
    const migrated = storage.get('_migrated_v4', false);
    if (!migrated) {
        migraDatiASicuro();
        storage.set('_migrated_v4', true);
    }
}
