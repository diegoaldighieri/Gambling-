// ===== DOM ELEMENTI =====
const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
const accontentati = document.getElementById("accontentati");
const numBombeInput = document.getElementById("numBombe");
const decreaseBombs = document.getElementById("decreaseBombs");
const increaseBombs = document.getElementById("increaseBombs");
const riskLevel = document.getElementById("riskLevel");
const scommessa = document.getElementById("scommessa");

// ===== VARIABILI GIOCO =====
let versione = 0;
let celle = [];
let bombe = [];
let cliccata = [];
let trovati = 0;
let inGioco = false;
let numBombe = 1;
let totalescommessa = 0;
let cmoltiplicatore = 1;
let currentTheme = 'default';
let soundsEnabled = true;

// ===== SISTEMA SUONI =====
const sounds = {
    click: createBeep(800, 0.05, 'sine'),
    diamond: createBeep(1200, 0.2, 'sine'),
    bomb: createBeep(100, 0.5, 'sawtooth'),
    win: createBeep(1500, 0.3, 'sine'),
    cashout: createBeep(1000, 0.3, 'triangle'),
    notification: createBeep(900, 0.15, 'sine'),
    levelup: createBeep(1800, 0.4, 'sine')
};

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

function playSound(soundName) {
    if (sounds[soundName]) {
        sounds[soundName]();
    }
}

// ===== SISTEMA NOTIFICHE =====
function showNotification(message, type = 'info', duration = 3000) {
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

// ===== LOCALSTORAGE CON GESTIONE ERRORI =====
const storage = {
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
            showNotification('Errore nel salvataggio dei dati', 'error');
            return false;
        }
    }
};

// ===== FUNZIONI CARICAMENTO/SALVATAGGIO =====
function salvaCaramelle(n) {
    storage.set('caramelle', n);
}

function caricaCaramelle() {
    return storage.get('caramelle', 500);
}

function salvaTema(tema) {
    storage.set('tema', tema);
}

function caricaTema() {
    return storage.get('tema', 'default');
}

function salvaUltimaScommessa(scommessa) {
    storage.set('ultimaScommessa', scommessa);
}

function caricaUltimaScommessa() {
    return storage.get('ultimaScommessa', 0);
}

function salvaUltimaBombeCount(count) {
    storage.set('ultimeBombe', count);
}

function caricaUltimaBombeCount() {
    return storage.get('ultimeBombe', 1);
}

function salvaUltimaVersione(ver) {
    storage.set('ultimaVersione', ver);
}

function caricaUltimaVersione() {
    return storage.get('ultimaVersione', 0);
}

// ===== SISTEMA STATISTICHE =====
function caricaStatistiche() {
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

function salvaStatistiche(stats) {
    storage.set('statistiche', stats);
}

function aggiornaStatistiche(tipo, importo) {
    const stats = caricaStatistiche();

    stats.partiteGiocate++;
    stats.totaleScommesso += totalescommessa;

    if (tipo === 'vinta') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    } else if (tipo === 'persa') {
        stats.partitePerse++;
        stats.ultimaVincita = -totalescommessa;

        if (totalescommessa > stats.perditaMassima) {
            stats.perditaMassima = totalescommessa;
        }
    } else if (tipo === 'cashout') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    }

    salvaStatistiche(stats);
    aggiornaUIStatistiche();
    checkLevelUp();
    checkAchievements();
}

function aggiornaUIStatistiche() {
    const stats = caricaStatistiche();

    document.getElementById('partiteGiocate').textContent = stats.partiteGiocate;
    document.getElementById('partiteVinte').textContent = stats.partiteVinte;
    document.getElementById('partitePerse').textContent = stats.partitePerse;
    document.getElementById('totaleScommesso').textContent = stats.totaleScommesso;
    document.getElementById('totaleVinto').textContent = stats.totaleVinto;
    document.getElementById('vincitaMassima').textContent = stats.vincitaMassima;
    document.getElementById('perditaMassima').textContent = stats.perditaMassima;

    const ultimaVincitaEl = document.getElementById('ultimaVincita');
    ultimaVincitaEl.textContent = stats.ultimaVincita;

    if (stats.ultimaVincita > 0) {
        ultimaVincitaEl.style.color = '#00cc66';
    } else if (stats.ultimaVincita < 0) {
        ultimaVincitaEl.style.color = '#ef4444';
    } else {
        ultimaVincitaEl.style.color = 'var(--color-primary)';
    }

    const percVittorie = stats.partiteGiocate > 0
        ? ((stats.partiteVinte / stats.partiteGiocate) * 100).toFixed(1)
        : 0;
    document.getElementById('percVittorie').textContent = percVittorie;

    const profittoNetto = stats.totaleVinto - stats.totaleScommesso;
    const profittoNettoEl = document.getElementById('profittoNetto');
    profittoNettoEl.textContent = profittoNetto;

    if (profittoNetto > 0) {
        profittoNettoEl.style.color = '#00cc66';
    } else if (profittoNetto < 0) {
        profittoNettoEl.style.color = '#ef4444';
    } else {
        profittoNettoEl.style.color = 'var(--color-primary)';
    }
}

function resetStatistiche() {
    if (confirm('Sei sicuro di voler resettare tutte le statistiche?')) {
        const statsVuote = {
            partiteGiocate: 0,
            partiteVinte: 0,
            partitePerse: 0,
            totaleScommesso: 0,
            totaleVinto: 0,
            ultimaVincita: 0,
            vincitaMassima: 0,
            perditaMassima: 0
        };
        salvaStatistiche(statsVuote);
        aggiornaUIStatistiche();

        // Reset anche livello
        storage.set('lastKnownLevel', 1);
        updateLevelDisplay();

        showNotification('Statistiche resettate!', 'success');
    }
}
// ===== SISTEMA LIVELLI MIGLIORATO =====
const levels = {
    1: { name: 'Principiante', icon: '🎮', multiplier: 1.0, minGames: 0, color: '#9ca3af' },
    2: { name: 'Intermedio', icon: '🎯', multiplier: 1.05, minGames: 10, color: '#60a5fa' },
    3: { name: 'Esperto', icon: '⭐', multiplier: 1.10, minGames: 50, color: '#a78bfa' },
    4: { name: 'Maestro', icon: '👑', multiplier: 1.15, minGames: 100, color: '#fbbf24' },
    5: { name: 'Leggenda', icon: '💎', multiplier: 1.20, minGames: 250, color: '#ffc400' }
};

function getPlayerLevel() {
    const stats = caricaStatistiche();
    const gamesPlayed = stats.partiteGiocate;

    for (let level = 5; level >= 1; level--) {
        if (gamesPlayed >= levels[level].minGames) {
            return level;
        }
    }
    return 1;
}

function getNextLevelInfo() {
    const currentLevel = getPlayerLevel();
    if (currentLevel >= 5) return null;

    const nextLevel = currentLevel + 1;
    const stats = caricaStatistiche();
    const gamesPlayed = stats.partiteGiocate;
    const gamesNeeded = levels[nextLevel].minGames;
    const gamesRemaining = gamesNeeded - gamesPlayed;

    return {
        nextLevel,
        gamesNeeded,
        gamesRemaining,
        gamesPlayed,
        progress: (gamesPlayed / gamesNeeded) * 100
    };
}

function updateLevelDisplay() {
    const level = getPlayerLevel();
    const levelData = levels[level];

    // Aggiorna numero livello e nome
    document.getElementById('playerLevel').textContent = level;
    document.getElementById('playerLevelName').textContent = levelData.name;

    // Aggiorna icona
    const levelIcon = document.getElementById('levelIcon');
    if (levelIcon) {
        levelIcon.textContent = levelData.icon;
    }

    // Aggiorna bonus moltiplicatore
    const bonusPercentage = ((levelData.multiplier - 1) * 100).toFixed(0);
    document.getElementById('levelBonusMultiplier').textContent = `+${bonusPercentage}%`;

    // Aggiorna barra di progresso
    const nextLevelInfo = getNextLevelInfo();
    const progressFill = document.getElementById('levelProgressFill');
    const progressText = document.getElementById('levelProgressText');

    if (nextLevelInfo) {
        const progressPercent = Math.min(100, nextLevelInfo.progress);
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${nextLevelInfo.gamesPlayed} / ${nextLevelInfo.gamesNeeded} partite`;
    } else {
        // Livello massimo raggiunto
        progressFill.style.width = '100%';
        progressText.textContent = 'LIVELLO MASSIMO!';
    }

    // Aggiorna colore barra in base al livello
    if (progressFill) {
        progressFill.style.setProperty('--level-color', levelData.color);
    }
}

function checkLevelUp() {
    const currentLevel = getPlayerLevel();
    const previousLevel = storage.get('lastKnownLevel', 1);

    if (currentLevel > previousLevel) {
        storage.set('lastKnownLevel', currentLevel);
        showLevelUpNotification(currentLevel);
        playSound('levelup');
        updateLevelDisplay();
    }
}

function showLevelUpNotification(newLevel) {
    const levelData = levels[newLevel];
    const notification = document.getElementById('levelUpNotification');
    const levelUpName = document.getElementById('levelUpName');
    const levelUpBonus = document.getElementById('levelUpBonus');
    const levelUpIcon = notification.querySelector('.level-up-icon');

    levelUpIcon.textContent = levelData.icon;
    levelUpName.textContent = `${levelData.name} - Livello ${newLevel}`;

    const bonusPercentage = ((levelData.multiplier - 1) * 100).toFixed(0);
    levelUpBonus.textContent = `Bonus Moltiplicatore: +${bonusPercentage}%`;

    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

// ===== SISTEMA ACHIEVEMENTS MIGLIORATO =====
const achievements = [
    {
        id: 'prima_vittoria',
        name: 'Prima Vittoria',
        icon: '🏆',
        description: 'Vinci la tua prima partita',
        check: (stats) => stats.partiteVinte >= 1
    },
    {
        id: 'combo_5',
        name: 'Combo 5x',
        icon: '🔥',
        description: 'Trova 5 diamanti di fila in una partita',
        check: () => trovati >= 5 && inGioco
    },
    {
        id: 'vincita_1000',
        name: 'Jackpot 1000+',
        icon: '💰',
        description: 'Vinci 1000 o più in una singola partita',
        check: (stats) => stats.vincitaMassima >= 1000
    },
    {
        id: 'griglia_completa',
        name: 'Perfezionista',
        icon: '💎',
        description: 'Completa una griglia 5×5 senza errori',
        check: () => versione === 3 && trovati === (25 - numBombe) && inGioco
    },
    {
        id: 'rischio_estremo',
        name: 'Temerario',
        icon: '⚡',
        description: 'Vinci una partita con 10+ bombe',
        check: () => numBombe >= 10 && !inGioco
    },
    {
        id: 'serie_10',
        name: 'Invincibile',
        icon: '🛡️',
        description: 'Vinci 10 partite consecutive',
        check: (stats) => {
            const streak = storage.get('currentStreak', 0);
            return streak >= 10;
        }
    },
    {
        id: 'partite_50',
        name: 'Veterano',
        icon: '🎖️',
        description: 'Gioca 50 partite',
        check: (stats) => stats.partiteGiocate >= 50
    },
    {
        id: 'partite_100',
        name: 'Esperto Certificato',
        icon: '⭐',
        description: 'Gioca 100 partite',
        check: (stats) => stats.partiteGiocate >= 100
    },
    {
        id: 'profitto_5000',
        name: 'Imprenditore',
        icon: '📈',
        description: 'Ottieni un profitto netto di 5000+',
        check: (stats) => (stats.totaleVinto - stats.totaleScommesso) >= 5000
    },
    {
        id: 'cashout_veloce',
        name: 'Giocatore Prudente',
        icon: '🎯',
        description: 'Ritira la vincita dopo aver trovato solo 1 diamante',
        check: () => trovati === 1 && !inGioco
    }
];

function caricaAchievements() {
    return storage.get('achievements', []);
}

function salvaAchievements(unlockedAchievements) {
    storage.set('achievements', unlockedAchievements);
}

function checkAchievements() {
    const stats = caricaStatistiche();
    const unlocked = caricaAchievements();

    achievements.forEach(achievement => {
        if (!unlocked.includes(achievement.id) && achievement.check(stats)) {
            unlocked.push(achievement.id);
            salvaAchievements(unlocked);
            showAchievementUnlocked(achievement);
            updateAchievementsButton();
        }
    });
}

function showAchievementUnlocked(achievement) {
    const notification = document.getElementById('achievementUnlocked');
    const nameEl = document.getElementById('achievementName');
    const iconEl = notification.querySelector('.achievement-icon');

    iconEl.textContent = achievement.icon;
    nameEl.textContent = `${achievement.name} - ${achievement.description}`;

    notification.classList.add('show');
    playSound('win');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}

function updateAchievementsButton() {
    const unlocked = caricaAchievements();
    const button = document.getElementById('achievementsButton');

    // Aggiorna il contatore sul pulsante
    button.setAttribute('data-count', unlocked.length);
}

function renderAchievements() {
    const unlocked = caricaAchievements();
    const stats = caricaStatistiche();
    const list = document.getElementById('achievementsList');

    // Aggiorna overview progresso
    const totalAchievements = achievements.length;
    const unlockedCount = unlocked.length;
    const progressPercent = (unlockedCount / totalAchievements) * 100;

    document.getElementById('achievementsUnlocked').textContent = unlockedCount;
    document.getElementById('achievementsTotal').textContent = totalAchievements;
    document.getElementById('achievementsProgressBar').style.width = `${progressPercent}%`;

    list.innerHTML = achievements.map(achievement => {
        const isUnlocked = unlocked.includes(achievement.id);
        const isCloseToUnlock = !isUnlocked && achievement.check(stats);

        return `
            <div class="achievement-item ${isUnlocked ? 'unlocked' : ''} ${isCloseToUnlock ? 'close' : ''}">
                <div class="achievement-icon-big">${achievement.icon}</div>
                <div class="achievement-details">
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-description">${achievement.description}</div>
                </div>
                ${isUnlocked ? '<div class="achievement-checkmark">✓</div>' : ''}
            </div>
        `;
    }).join('');
}

// ===== DAILY BONUS =====
function checkDailyBonus() {
    const lastLogin = storage.get('lastLogin', '');
    const today = new Date().toDateString();

    if (lastLogin !== today) {
        const bonus = 100;
        setCaramelle(getCaramelle() + bonus);
        document.getElementById('dailyBonusAmount').textContent = bonus;
        document.getElementById('dailyBonusPopup').style.display = 'flex';
        storage.set('lastLogin', today);
        playSound('win');
    }
}

function closeDailyBonus() {
    document.getElementById('dailyBonusPopup').style.display = 'none';
}

// ===== GESTIONE SALDO =====
function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

function setCaramelle(n) {
    if (n < 0) n = 0;
    const oldValue = getCaramelle();
    animateValue(document.getElementById("caramelle"), oldValue, n, 500);
    salvaCaramelle(n);
}

function animateValue(element, start, end, duration) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Inizializza caramelle dal storage
setCaramelle(caricaCaramelle());
// ===== MOLTIPLICATORI =====
const moltiplicatoriTabelle = {
    "9_1": [1.10, 1.23, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02],
    "9_2": [1.23, 1.57, 2.12, 3.02, 4.50, 7.20, 11.70],
    "9_3": [1.38, 2.12, 3.66, 7.20, 14.40, 31.50],
    "9_4": [1.57, 3.02, 7.20, 18.00, 49.50],
    "9_5": [1.80, 4.50, 14.40, 49.50],
    "9_6": [2.12, 7.20, 31.50],
    "16_1": [1.06, 1.11, 1.18, 1.25, 1.33, 1.42, 1.51, 1.62, 1.74, 1.87, 2.02, 2.20, 2.42, 2.67, 2.96],
    "16_2": [1.11, 1.25, 1.42, 1.62, 1.87, 2.20, 2.67, 3.30, 4.12, 5.28, 6.92, 9.42, 13.20],
    "16_3": [1.18, 1.42, 1.74, 2.20, 2.96, 4.12, 5.97, 9.13, 14.84, 25.74, 49.50, 112.64],
    "16_4": [1.25, 1.62, 2.20, 3.30, 5.28, 9.13, 17.32, 36.30, 88.00, 264.00],
    "16_5": [1.33, 1.87, 2.96, 5.28, 10.56, 24.24, 64.36, 214.50],
    "16_6": [1.42, 2.20, 4.12, 9.13, 24.24, 79.20, 346.50],
    "16_7": [1.51, 2.67, 5.97, 17.32, 64.36, 346.50],
    "16_8": [1.62, 3.30, 9.13, 36.30, 214.50],
    "16_9": [1.74, 4.12, 14.84, 88.00],
    "16_10": [1.87, 5.28, 25.74, 264.00],
    "16_11": [2.02, 6.92, 49.50],
    "16_12": [2.20, 9.42, 112.64],
    "25_1": [1.03, 1.07, 1.10, 1.14, 1.18, 1.22, 1.27, 1.32, 1.37, 1.42, 1.48, 1.54, 1.61, 1.68, 1.76, 1.84, 1.94, 2.03, 2.14, 2.26, 2.40, 2.54, 2.71, 2.90],
    "25_2": [1.07, 1.14, 1.22, 1.32, 1.42, 1.54, 1.68, 1.84, 2.03, 2.26, 2.54, 2.90, 3.36, 4.12, 4.97, 6.13, 7.73, 10.06, 13.66, 19.48, 30.26, 52.51],
    "25_3": [1.10, 1.22, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02, 3.66, 4.50, 5.59, 7.05, 9.04, 11.81, 15.85, 21.94, 31.63, 48.10, 78.47, 140.63, 295.31],
    "25_4": [1.14, 1.32, 1.54, 1.84, 2.26, 2.90, 4.12, 6.13, 10.06, 19.48, 48.10, 140.63, 590.63],
    "25_5": [1.18, 1.42, 1.76, 2.26, 3.13, 4.54, 7.04, 11.79, 21.44, 44.00, 103.13, 288.81, 963.00],
    "25_10": [1.48, 2.54, 5.59, 13.75, 41.27, 151.36, 743.00, 5280.00],
    "25_15": [1.94, 6.13, 30.26, 288.81, 8800.00],
    "25_20": [2.90, 19.48, 577.50, 88000.00],
};

function getMoltiplicatorePerDiamanti(diamantiTrovati) {
    if (diamantiTrovati === 0) return 1.00;

    const totaleCelle = getTotaleCelle();
    const key = `${totaleCelle}_${numBombe}`;
    const tabella = moltiplicatoriTabelle[key];

    if (!tabella) {
        const celleRimaste = totaleCelle - diamantiTrovati;
        const bombeRimaste = numBombe;
        const celleSicure = celleRimaste - bombeRimaste;
        if (celleSicure <= 0) return 1.00;
        const probabilitaSicura = celleSicure / celleRimaste;
        return 1 / probabilitaSicura;
    }

    if (diamantiTrovati > tabella.length) return tabella[tabella.length - 1];

    return tabella[diamantiTrovati - 1];
}

function getTotaleCelle() {
    return versione === 1 ? 9 : versione === 2 ? 16 : versione === 3 ? 25 : 0;
}

function aggiornaMoltiplicatore() {
    const moltiplicatoreEl = document.getElementById("moltiplicatore");
    const vincitaEl = document.getElementById("vincita");
    const celleSicureEl = document.getElementById("celleSicure");
    const totaleCelleEl = document.getElementById("totaleCelle");

    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const finalMultiplier = cmoltiplicatore * levelMultiplier;

    moltiplicatoreEl.textContent = finalMultiplier.toFixed(2);
    vincitaEl.textContent = Math.floor(totalescommessa * finalMultiplier);

    const totaleCelle = getTotaleCelle();
    const celleSicureTotali = totaleCelle - numBombe;
    celleSicureEl.textContent = trovati;
    totaleCelleEl.textContent = celleSicureTotali;

    if (inGioco && cmoltiplicatore > 1) {
        moltiplicatoreEl.parentElement.classList.add('pulse');
        vincitaEl.parentElement.classList.add('pulse');

        setTimeout(() => {
            moltiplicatoreEl.parentElement.classList.remove('pulse');
            vincitaEl.parentElement.classList.remove('pulse');
        }, 500);
    }
}

// ===== LIVELLO DI RISCHIO =====
function aggiornaRischio() {
    const totaleCelle = getTotaleCelle();
    if (totaleCelle === 0) {
        riskLevel.textContent = "SELEZIONA GRIGLIA";
        riskLevel.className = "risk-indicator";
        return;
    }

    const percentuale = (numBombe / totaleCelle) * 100;

    if (percentuale >= 50) {
        riskLevel.textContent = "ESTREMO 🔥";
        riskLevel.className = "risk-indicator risk-extreme";
    } else if (percentuale >= 40) {
        riskLevel.textContent = "MOLTO ALTO ⚠️";
        riskLevel.className = "risk-indicator risk-very-high";
    } else if (percentuale >= 30) {
        riskLevel.textContent = "ALTO 📈";
        riskLevel.className = "risk-indicator risk-high";
    } else if (percentuale >= 20) {
        riskLevel.textContent = "MEDIO ⚖️";
        riskLevel.className = "risk-indicator risk-medium";
    } else if (percentuale >= 10) {
        riskLevel.textContent = "BASSO 📉";
        riskLevel.className = "risk-indicator risk-low";
    } else {
        riskLevel.textContent = "MOLTO BASSO 🛡️";
        riskLevel.className = "risk-indicator risk-very-low";
    }
}

// ===== SELEZIONE BOMBE =====
function aggiornaMaxBombe() {
    const totaleCelle = getTotaleCelle();
    if (totaleCelle === 0) {
        numBombeInput.max = 1;
        numBombe = 1;
        numBombeInput.value = 1;
        return;
    }

    const maxBombe = Math.floor(totaleCelle * 0.8);
    numBombeInput.max = maxBombe;

    if (numBombe > maxBombe) {
        numBombe = maxBombe;
        numBombeInput.value = maxBombe;
    }

    aggiornaRischio();
    aggiornaMoltiplicatore();
}

decreaseBombs.addEventListener("click", () => {
    if (inGioco) return;
    playSound('click');

    const min = parseInt(numBombeInput.min);
    if (numBombe > min) {
        numBombe--;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio();
        aggiornaMoltiplicatore();
    }
});

increaseBombs.addEventListener("click", () => {
    if (inGioco) return;
    playSound('click');

    const max = parseInt(numBombeInput.max);
    if (numBombe < max) {
        numBombe++;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio();
        aggiornaMoltiplicatore();
    }
});

numBombeInput.addEventListener("change", () => {
    if (inGioco) return;

    let val = parseInt(numBombeInput.value) || 1;
    const min = parseInt(numBombeInput.min);
    const max = parseInt(numBombeInput.max);

    if (val < min) val = min;
    if (val > max) val = max;

    numBombe = val;
    numBombeInput.value = val;
    salvaUltimaBombeCount(numBombe);
    aggiornaRischio();
    aggiornaMoltiplicatore();
});

// ===== VERSIONI GRIGLIA =====
const versioni = [v1, v2, v3];

versioni.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (inGioco) return;
        playSound('click');
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        versione = index + 1;
        salvaUltimaVersione(versione);
        aggiornaMaxBombe();
    });
});

// ===== GESTIONE SCOMMESSA =====
function setTotaleScommessa(n) {
    if (inGioco) {
        scommessa.value = totalescommessa;
        return;
    }

    if (n < 0) n = 0;
    if (n > getCaramelle()) n = getCaramelle();

    totalescommessa = n;
    scommessa.value = n;
    salvaUltimaScommessa(n);
    aggiornaMoltiplicatore();
}

scommessa.addEventListener("input", debounce(() => {
    if (inGioco) {
        scommessa.value = totalescommessa;
        return;
    }
    const valore = parseInt(scommessa.value) || 0;
    setTotaleScommessa(valore);
}, 300));

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

function aggiungi(amount) {
    if (inGioco) return;
    playSound('click');
    setTotaleScommessa(totalescommessa + amount);
}

document.getElementById("somma5").addEventListener("click", () => aggiungi(5));
document.getElementById("somma10").addEventListener("click", () => aggiungi(10));
document.getElementById("somma50").addEventListener("click", () => aggiungi(50));
document.getElementById("somma100").addEventListener("click", () => aggiungi(100));
document.getElementById("maxbet").addEventListener("click", () => aggiungi(getCaramelle()));

// ===== TEMI =====
function getThemeImage(theme) {
    const themeImages = {
        'default': 'images/gray-square.png',
        'dark': 'images/scuro-square.png',
        'neon': 'images/neon-square.png',
        'forest': 'images/forest-square.png',
        'sunset': 'images/tramonto-square.png',
        'ocean': 'images/oceano-square.png',
        'lava': 'images/lava-square.png',
        'cyberpunk': 'images/cyberpunk-square.png',
        'arctic': 'images/arctic-square.png',
        'goldRush': 'images/gold-square.png',
        'matrix': 'images/matrix-square.png',
        'purpleHaze': 'images/purple-haze-square.png',
    };
    return themeImages[theme] || themeImages['default'];
}

const themes = {
    default: {
        primary: '#ffc400',
        primaryHover: '#ffae00',
        secondary: '#00cc66',
        background: '#0b0f1a',
        cardBg: '#111627',
        cellBg: '#1a2030',
        text: '#ffffff',
        textDark: '#000000'
    },
    dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#a78bfa',
        background: '#000000',
        cardBg: '#1a1a1a',
        cellBg: '#2a2a2a',
        text: '#f9fafb',
        textDark: '#000000'
    },
    neon: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        secondary: '#06b6d4',
        background: '#0f172a',
        cardBg: '#1e293b',
        cellBg: '#334155',
        text: '#f0abfc',
        textDark: '#0f172a'
    },
    forest: {
        primary: '#10b981',
        primaryHover: '#059669',
        secondary: '#34d399',
        background: '#064e3b',
        cardBg: '#065f46',
        cellBg: '#047857',
        text: '#d1fae5',
        textDark: '#064e3b'
    },
    sunset: {
        primary: '#f59e0b',
        primaryHover: '#d97706',
        secondary: '#ef4444',
        background: '#7c2d12',
        cardBg: '#9a3412',
        cellBg: '#b45309',
        text: '#fef3c7',
        textDark: '#7c2d12'
    },
    ocean: {
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        secondary: '#06b6d4',
        background: '#0c4a6e',
        cardBg: '#075985',
        cellBg: '#0369a1',
        text: '#e0f2fe',
        textDark: '#0c4a6e'
    },
    cyberpunk: {
        primary: '#ff00ff',
        primaryHover: '#cc00cc',
        secondary: '#00ffff',
        background: '#0a0a0a',
        cardBg: '#1a0a1f',
        cellBg: '#2d1b3d',
        text: '#00ffff',
        textDark: '#0a0a0a'
    },
    lava: {
        primary: '#ff4500',
        primaryHover: '#ff6347',
        secondary: '#ff8c00',
        background: '#1a0000',
        cardBg: '#330000',
        cellBg: '#4d0000',
        text: '#ffcc99',
        textDark: '#1a0000'
    },
    arctic: {
        primary: '#00d4ff',
        primaryHover: '#00bfea',
        secondary: '#b3e5fc',
        background: '#0a1929',
        cardBg: '#1e3a52',
        cellBg: '#2d4f6b',
        text: '#e1f5fe',
        textDark: '#0a1929'
    },
    goldRush: {
        primary: '#ffd700',
        primaryHover: '#ffed4e',
        secondary: '#ffb347',
        background: '#000000',
        cardBg: '#1a1410',
        cellBg: '#2d2416',
        text: '#fff8dc',
        textDark: '#000000'
    },
    purpleHaze: {
        primary: '#9c27b0',
        primaryHover: '#ba68c8',
        secondary: '#e91e63',
        background: '#1a0033',
        cardBg: '#2d0052',
        cellBg: '#3d006b',
        text: '#f3e5f5',
        textDark: '#1a0033'
    },
    matrix: {
        primary: '#00ff00',
        primaryHover: '#00cc00',
        secondary: '#39ff14',
        background: '#000000',
        cardBg: '#001a00',
        cellBg: '#003300',
        text: '#00ff00',
        textDark: '#000000'
    }
};

function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-hover', theme.primaryHover);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--color-cell-bg', theme.cellBg);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-text-dark', theme.textDark);

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });

    salvaTema(themeName);

    if (inGioco) {
        celle.forEach((cella, index) => {
            if (!cliccata[index]) {
                const img = cella.querySelector('img.cella-img');
                if (img) {
                    img.src = getThemeImage(themeName);
                }
            }
        });
    }
}

document.getElementById('theme-button').addEventListener('click', () => {
    playSound('click');
    document.getElementById('theme-menu').classList.toggle('hidden');
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        playSound('click');
        applyTheme(btn.dataset.theme);
        document.getElementById('theme-menu').classList.add('hidden');
    });
});

// ===== VALIDAZIONE INPUT =====
function validateBet(amount) {
    const balance = getCaramelle();

    if (amount <= 0) {
        showNotification('⚠️ Inserisci una puntata valida!', 'warning');
        return false;
    }

    if (amount > balance) {
        showNotification('❌ Saldo insufficiente!', 'error');
        return false;
    }

    return true;
}

// ===== STREAK =====
function updateStreak(won) {
    let streak = storage.get('currentStreak', 0);

    if (won) {
        streak++;
        storage.set('currentStreak', streak);

        if (streak >= 5 && streak % 5 === 0) {
            showNotification(`🔥 Serie di ${streak} vittorie!`, 'success');
        }
    } else {
        storage.set('currentStreak', 0);
    }
}

// ===== GENERAZIONE GIOCO =====
function generacelle() {
    if (!validateBet(totalescommessa)) {
        return;
    }

    if (versione === 0) {
        showNotification('⚠️ Seleziona una dimensione della griglia!', 'warning');
        return;
    }

    playSound('click');

    celle.forEach(c => c.remove());
    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;

    cmoltiplicatore = 1;
    aggiornaMoltiplicatore();

    const grid = document.getElementById("grid");
    const totaleCelle = getTotaleCelle();

    if (totaleCelle === 0) return;

    inGioco = true;

    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

    for (let i = 0; i < totaleCelle; i++) {
        const cella = document.createElement("button");
        const img = document.createElement("img");

        img.src = getThemeImage(currentTheme);
        img.classList.add("cella-img");

        cella.appendChild(img);
        cella.id = "cella_" + i;

        grid.appendChild(cella);

        celle.push(cella);
        cliccata.push(false);
    }

    bombe = [];
    while (bombe.length < numBombe) {
        const indiceBomba = Math.floor(Math.random() * totaleCelle);
        if (!bombe.includes(indiceBomba)) {
            bombe.push(indiceBomba);
        }
    }

    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => {
            if (cliccata[index]) return;
            cliccata[index] = true;

            cella.classList.add('revealing');

            setTimeout(() => {
                cella.innerHTML = "";

                if (bombe.includes(index)) {
                    // BOMBA
                    playSound('bomb');
                    cella.classList.remove('revealing');
                    cella.classList.add('bomb-reveal');
                    cella.innerHTML = "💣";

                    const gridWrapper = document.querySelector('.grid-wrapper');
                    gridWrapper.classList.add('shake');
                    setTimeout(() => gridWrapper.classList.remove('shake'), 500);

                    setTimeout(() => {
                        celle.forEach((c, i) => {
                            if (!cliccata[i]) {
                                c.innerHTML = "";
                                if (bombe.includes(i)) {
                                    c.classList.add('bomb-reveal-secondary');
                                    c.innerHTML = "💣";
                                } else {
                                    c.classList.add('diamond-reveal-missed');
                                    c.innerHTML = "💎";
                                }
                            }
                        });
                    }, 300);

                    setTimeout(() => {
                        setCaramelle(getCaramelle() - totalescommessa);
                        document.getElementById("statCelleTrovate").textContent = trovati;

                        aggiornaStatistiche('persa', 0);
                        updateStreak(false);

                        inGioco = false;
                        document.getElementById("overlay").style.display = "flex";
                    }, 1000);

                    return;
                }

                // DIAMANTE
                playSound('diamond');
                cella.classList.remove('revealing');
                cella.classList.add('diamond-reveal');

                if (trovati >= 2) {
                    cella.classList.add('combo-hit');
                }

                cella.innerHTML = "💎";
                trovati++;

                cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati);
                aggiornaMoltiplicatore();
                checkAchievements();

                const celleSicureTotali = totaleCelle - numBombe;
                if (trovati === celleSicureTotali) {
                    const levelMultiplier = levels[getPlayerLevel()].multiplier;
                    const premio = Math.floor(totalescommessa * cmoltiplicatore * levelMultiplier);

                    setTimeout(() => {
                        celle.forEach((c, i) => {
                            if (!cliccata[i]) {
                                c.innerHTML = "";
                                if (bombe.includes(i)) {
                                    c.classList.add('bomb-reveal-win');
                                    c.innerHTML = "💣";
                                }
                            }
                        });
                    }, 300);

                    setTimeout(() => {
                        playSound('win');
                        setCaramelle(getCaramelle() + premio);
                        document.getElementById("statVincita").textContent = premio;

                        aggiornaStatistiche('vinta', premio);
                        updateStreak(true);
                        checkAchievements();

                        inGioco = false;
                        document.getElementById("overlay2").style.display = "flex";
                    }, 1200);
                }
            }, 300);
            salvaStatoGioco();
        });
    });
}

start.addEventListener("click", generacelle);

// ===== CASHOUT =====
accontentati.addEventListener("click", () => {
    if (!inGioco) return;

    if (trovati === 0) {
        showNotification('❌ Devi scoprire almeno una cella prima di ritirare!', 'error');
        return;
    }

    playSound('cashout');

    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const premio = Math.floor(totalescommessa * cmoltiplicatore * levelMultiplier);
    setCaramelle(getCaramelle() + premio - totalescommessa);

    document.getElementById("statCashout").textContent = premio;

    celle.forEach((c, i) => {
        if (!cliccata[i]) {
            c.innerHTML = "";
            if (bombe.includes(i)) {
                c.classList.add('bomb-reveal-cashout');
                c.innerHTML = "💣";
            } else {
                c.classList.add('diamond-reveal-missed');
                c.innerHTML = "💎";
            }
        }
    });

    aggiornaStatistiche('cashout', premio);
    updateStreak(true);
    checkAchievements();

    resetStatoGioco();

    inGioco = false;

    setTimeout(() => {
        document.getElementById("overlay3").style.display = "flex";
    }, 500);
});

// ===== CLOSE POPUP =====
function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("overlay2").style.display = "none";
    document.getElementById("overlay3").style.display = "none";

    celle.forEach(c => c.remove());

    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;
    cmoltiplicatore = 1;
    inGioco = false;

    if (totalescommessa > getCaramelle()) {
        totalescommessa = 0;
        scommessa.value = 0;
    }

    aggiornaMoltiplicatore();
}

// ===== SHARE RESULT =====
function shareResult() {
    const stats = caricaStatistiche();
    const amount = stats.ultimaVincita;
    const grid = versione === 1 ? '3×3' : versione === 2 ? '4×4' : '5×5';

    const text = `🎮 Ho vinto ${amount}💵 su Caccia al Tesoro!\n` +
        `Griglia: ${grid} | Bombe: ${numBombe}\n` +
        `Riesci a fare di meglio? 💎`;

    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('📋 Copiato negli appunti!', 'success');
        });
    }
}

// ===== GESTIONE MODALI =====
const statsButton = document.getElementById('statsButton');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.getElementById('closeStats');
const resetStatsBtn = document.getElementById('resetStats');
const exportStatsBtn = document.getElementById('exportStats');

statsButton?.addEventListener('click', () => {
    playSound('click');
    statsModal.style.display = 'flex';
    aggiornaUIStatistiche();
});

closeStatsBtn?.addEventListener('click', () => {
    playSound('click');
    statsModal.style.display = 'none';
});

resetStatsBtn?.addEventListener('click', () => {
    playSound('click');
    resetStatistiche();
});

exportStatsBtn?.addEventListener('click', () => {
    playSound('click');
    const data = {
        balance: getCaramelle(),
        stats: caricaStatistiche(),
        achievements: caricaAchievements(),
        level: getPlayerLevel(),
        theme: caricaTema(),
        timestamp: Date.now()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `caccia-tesoro-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('💾 Dati esportati!', 'success');
});

statsModal?.addEventListener('click', (e) => {
    if (e.target === statsModal) {
        statsModal.style.display = 'none';
    }
});

// Achievements Modal
const achievementsButton = document.getElementById('achievementsButton');
const achievementsModal = document.getElementById('achievementsModal');
const closeAchievementsBtn = document.getElementById('closeAchievements');

achievementsButton?.addEventListener('click', () => {
    playSound('click');
    achievementsModal.style.display = 'flex';
    renderAchievements();
});

closeAchievementsBtn?.addEventListener('click', () => {
    playSound('click');
    achievementsModal.style.display = 'none';
});

achievementsModal?.addEventListener('click', (e) => {
    if (e.target === achievementsModal) {
        achievementsModal.style.display = 'none';
    }
});

// Tutorial Modal
const tutorialButton = document.getElementById('tutorialButton');
const tutorialModal = document.getElementById('tutorialModal');
const closeTutorialBtn = document.getElementById('closeTutorial');
const nextTutorialBtn = document.getElementById('nextTutorialStep');
const skipTutorialBtn = document.getElementById('skipTutorial');

let currentTutorialStep = 0;

tutorialButton?.addEventListener('click', () => {
    playSound('click');
    tutorialModal.style.display = 'flex';
    currentTutorialStep = 0;
    showTutorialStep(0);
});

closeTutorialBtn?.addEventListener('click', () => {
    playSound('click');
    tutorialModal.style.display = 'none';
});

skipTutorialBtn?.addEventListener('click', () => {
    playSound('click');
    tutorialModal.style.display = 'none';
    storage.set('tutorialCompleted', true);
});

nextTutorialBtn?.addEventListener('click', () => {
    playSound('click');
    const steps = document.querySelectorAll('.tutorial-step');
    currentTutorialStep++;

    if (currentTutorialStep >= steps.length) {
        tutorialModal.style.display = 'none';
        storage.set('tutorialCompleted', true);
        showNotification('✅ Tutorial completato!', 'success');
    } else {
        showTutorialStep(currentTutorialStep);
    }
});

function showTutorialStep(index) {
    const steps = document.querySelectorAll('.tutorial-step');
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === index);
    });

    const nextBtn = document.getElementById('nextTutorialStep');
    if (index === steps.length - 1) {
        nextBtn.textContent = 'Fine';
    } else {
        nextBtn.textContent = 'Avanti';
    }
}

tutorialModal?.addEventListener('click', (e) => {
    if (e.target === tutorialModal) {
        tutorialModal.style.display = 'none';
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'Escape') {
        closePopup();
        statsModal.style.display = 'none';
        achievementsModal.style.display = 'none';
        tutorialModal.style.display = 'none';
    }

    if (!inGioco) {
        if (e.key === 's' || e.key === 'S') start.click();
        if (e.key === '1') v1.click();
        if (e.key === '2') v2.click();
        if (e.key === '3') v3.click();
    } else {
        if (e.key === 'c' || e.key === 'C') accontentati.click();
    }
});

// ===== CONFERMA PRIMA DI CHIUDERE =====
window.addEventListener('beforeunload', (e) => {
    if (inGioco) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// ===== SALVATAGGIO STATO GIOCO =====
function salvaStatoGioco() {
    const stato = {
        inGioco,
        versione,
        numBombe,
        totalescommessa,
        cmoltiplicatore,
        trovati,
        bombe,
        cliccata
    };
    storage.set("statoGioco", stato);
}

function caricaStatoGioco() {
    return storage.get("statoGioco", null);
}

function resetStatoGioco() {
    localStorage.removeItem("statoGioco");
}

// ===== SALVATAGGIO AUTOMATICO =====
setInterval(() => {
    if (inGioco) salvaStatoGioco();
}, 30000);

// ===== INIZIALIZZAZIONE =====
window.addEventListener('DOMContentLoaded', () => {
    // Carica tema
    const temaSalvato = caricaTema();
    applyTheme(temaSalvato);

    // Carica versione
    const versioneSalvata = caricaUltimaVersione();
    if (versioneSalvata > 0) {
        versione = versioneSalvata;
        const btnVersione = document.getElementById(`Versione${versioneSalvata}`);
        if (btnVersione) {
            versioni.forEach(b => b.classList.remove("active"));
            btnVersione.classList.add("active");
            aggiornaMaxBombe();
        }
    }

    // Carica bombe
    const bombeSalvate = caricaUltimaBombeCount();
    numBombe = bombeSalvate;
    numBombeInput.value = bombeSalvate;

    // Carica scommessa
    const scommessaSalvata = caricaUltimaScommessa();
    totalescommessa = scommessaSalvata;
    scommessa.value = scommessaSalvata;

    aggiornaRischio();
    aggiornaMoltiplicatore();
    aggiornaUIStatistiche();
    updateLevelDisplay();
    updateAchievementsButton();

    // Daily bonus
    checkDailyBonus();

    // Tutorial per nuovi utenti
    if (!storage.get('tutorialCompleted', false) && !storage.get('lastLogin', '')) {
        setTimeout(() => {
            tutorialModal.style.display = 'flex';
            showTutorialStep(0);
        }, 1000);
    }

    // Ripristina stato gioco se presente
    const stato = caricaStatoGioco();
    if (stato && stato.inGioco) {
        inGioco = true;
        versione = stato.versione;
        numBombe = stato.numBombe;
        totalescommessa = stato.totalescommessa;
        cmoltiplicatore = stato.cmoltiplicatore;
        trovati = stato.trovati;
        bombe = stato.bombe;
        cliccata = stato.cliccata;

        scommessa.value = totalescommessa;
        numBombeInput.value = numBombe;

        versioni.forEach(b => b.classList.remove("active"));
        document.getElementById(`Versione${versione}`)?.classList.add("active");

        aggiornaMaxBombe();
        aggiornaMoltiplicatore();

        const grid = document.getElementById("grid");
        const totaleCelle = getTotaleCelle();

        grid.style.gridTemplateColumns =
            versione === 1 ? "repeat(3, 1fr)" :
                versione === 2 ? "repeat(4, 1fr)" :
                    "repeat(5, 1fr)";

        for (let i = 0; i < totaleCelle; i++) {
            const cella = document.createElement("button");
            cella.id = "cella_" + i;
            grid.appendChild(cella);
            celle.push(cella);

            if (cliccata[i]) {
                cella.innerHTML = "";
                if (bombe.includes(i)) {
                    cella.classList.add("bomb-reveal");
                    cella.innerHTML = "💣";
                } else {
                    cella.classList.add("diamond-reveal");
                    cella.innerHTML = "💎";
                }
            } else {
                const img = document.createElement("img");
                img.src = getThemeImage(currentTheme);
                img.classList.add("cella-img");
                cella.appendChild(img);

                cella.addEventListener("click", () => {
                    if (cliccata[i]) return;
                    cliccata[i] = true;

                    cella.classList.add('revealing');

                    setTimeout(() => {
                        cella.innerHTML = "";

                        if (bombe.includes(i)) {
                            playSound('bomb');
                            cella.classList.remove('revealing');
                            cella.classList.add('bomb-reveal');
                            cella.innerHTML = "💣";

                            const gridWrapper = document.querySelector('.grid-wrapper');
                            gridWrapper.classList.add('shake');
                            setTimeout(() => gridWrapper.classList.remove('shake'), 500);

                            setTimeout(() => {
                                celle.forEach((c, idx) => {
                                    if (!cliccata[idx]) {
                                        c.innerHTML = "";
                                        if (bombe.includes(idx)) {
                                            c.classList.add('bomb-reveal-secondary');
                                            c.innerHTML = "💣";
                                        } else {
                                            c.classList.add('diamond-reveal-missed');
                                            c.innerHTML = "💎";
                                        }
                                    }
                                });
                            }, 300);

                            setTimeout(() => {
                                setCaramelle(getCaramelle() - totalescommessa);
                                document.getElementById("statCelleTrovate").textContent = trovati;
                                aggiornaStatistiche('persa', 0);
                                updateStreak(false);
                                inGioco = false;
                                document.getElementById("overlay").style.display = "flex";
                            }, 1000);

                            return;
                        }

                        playSound('diamond');
                        cella.classList.remove('revealing');
                        cella.classList.add('diamond-reveal');

                        if (trovati >= 2) {
                            cella.classList.add('combo-hit');
                        }

                        cella.innerHTML = "💎";
                        trovati++;

                        cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati);
                        aggiornaMoltiplicatore();
                        checkAchievements();

                        const celleSicureTotali = totaleCelle - numBombe;
                        if (trovati === celleSicureTotali) {
                            const levelMultiplier = levels[getPlayerLevel()].multiplier;
                            const premio = Math.floor(totalescommessa * cmoltiplicatore * levelMultiplier);

                            setTimeout(() => {
                                celle.forEach((c, idx) => {
                                    if (!cliccata[idx]) {
                                        c.innerHTML = "";
                                        if (bombe.includes(idx)) {
                                            c.classList.add('bomb-reveal-win');
                                            c.innerHTML = "💣";
                                        }
                                    }
                                });
                            }, 300);

                            setTimeout(() => {
                                playSound('win');
                                setCaramelle(getCaramelle() + premio);
                                document.getElementById("statVincita").textContent = premio;
                                aggiornaStatistiche('vinta', premio);
                                updateStreak(true);
                                checkAchievements();
                                inGioco = false;
                                document.getElementById("overlay2").style.display = "flex";
                            }, 1200);
                        }
                    }, 300);
                    salvaStatoGioco();
                });
            }
        }

        showNotification('🔄 Partita ripristinata!', 'info');
    }
});
