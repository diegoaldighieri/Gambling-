// ===== GESTIONE STORAGE =====

// Sistema storage con gestione errori
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

// Funzioni specifiche per caricamento/salvataggio
export function salvaCaramelle(n) {
    storage.set('caramelle', n);
}

export function caricaCaramelle() {
    return storage.get('caramelle', 500);
}

export function salvaTema(tema) {
    storage.set('tema', tema);
}

export function caricaTema() {
    return storage.get('tema', 'default');
}

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

// Statistiche
export function caricaStatistiche() {
    return storage.get('statistiche', {
        partiteGiocate: 0,
        partiteVinte: 0,
        partitePerse: 0,
        totaleScommesso: 0,
        totaleVinto: 0,
        ultimaVincita: 0,
        vincitaMassima: 0,
        perditaMassima: 0
    });
}

export function salvaStatistiche(stats) {
    storage.set('statistiche', stats);
}

// Achievements
export function caricaAchievements() {
    return storage.get('achievements', []);
}

export function salvaAchievements(unlockedAchievements) {
    storage.set('achievements', unlockedAchievements);
}

// Stato gioco
export function salvaStatoGioco(stato) {
    storage.set("statoGioco", stato);
}

export function caricaStatoGioco() {
    return storage.get("statoGioco", null);
}

export function resetStatoGioco() {
    storage.remove("statoGioco");
}

// Streak
export function getStreak() {
    return storage.get('currentStreak', 0);
}

export function setStreak(streak) {
    storage.set('currentStreak', streak);
}

// Last known level
export function getLastKnownLevel() {
    return storage.get('lastKnownLevel', 1);
}

export function setLastKnownLevel(level) {
    storage.set('lastKnownLevel', level);
}

// Daily bonus
export function getLastLogin() {
    return storage.get('lastLogin', '');
}

export function setLastLogin(date) {
    storage.set('lastLogin', date);
}

// Tutorial
export function isTutorialCompleted() {
    return storage.get('tutorialCompleted', false);
}

export function setTutorialCompleted(completed) {
    storage.set('tutorialCompleted', completed);
}
