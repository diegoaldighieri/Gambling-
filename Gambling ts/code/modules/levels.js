// ===== GESTIONE LIVELLI =====

import { levels } from './config.js';
import { caricaStatistiche } from './storage.js';
import { getLastKnownLevel, setLastKnownLevel } from './storage.js';
import { playSound } from './audio.js';

// Ottieni il livello del giocatore
export function getPlayerLevel() {
    const stats = caricaStatistiche();
    const gamesPlayed = stats.partiteGiocate;

    for (let level = 5; level >= 1; level--) {
        if (gamesPlayed >= levels[level].minGames) {
            return level;
        }
    }
    return 1;
}

// Ottieni info sul prossimo livello
export function getNextLevelInfo() {
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

// Aggiorna il display del livello
export function updateLevelDisplay() {
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

// Controlla se il giocatore è salito di livello
export function checkLevelUp() {
    const currentLevel = getPlayerLevel();
    const previousLevel = getLastKnownLevel();

    if (currentLevel > previousLevel) {
        setLastKnownLevel(currentLevel);
        showLevelUpNotification(currentLevel);
        playSound('levelup');
        updateLevelDisplay();
    }
}

// Mostra notifica di level up
export function showLevelUpNotification(newLevel) {
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
