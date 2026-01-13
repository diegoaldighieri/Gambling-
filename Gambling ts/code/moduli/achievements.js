// ===== GESTIONE ACHIEVEMENTS =====

import { achievements } from './config.js';
import { caricaAchievements, salvaAchievements, getStreak } from './storage.js';
import { caricaStatistiche } from './storage.js';
import { playSound } from './audio.js';

// Verifica se gli obiettivi sono stati raggiunti
export function checkAchievements(gameState = {}) {
    const stats = caricaStatistiche();
    const unlocked = caricaAchievements();
    const streak = getStreak();

    achievements.forEach(achievement => {
        if (!unlocked.includes(achievement.id)) {
            let shouldUnlock = false;

            // Gestione diversa per ogni tipo di achievement
            switch (achievement.id) {
                case 'prima_vittoria':
                    shouldUnlock = achievement.check(stats);
                    break;
                case 'combo_5':
                    shouldUnlock = achievement.check(gameState.trovati || 0, gameState.inGioco || false);
                    break;
                case 'vincita_1000':
                case 'partite_50':
                case 'partite_100':
                case 'profitto_5000':
                    shouldUnlock = achievement.check(stats);
                    break;
                case 'griglia_completa':
                    shouldUnlock = achievement.check(
                        gameState.trovati || 0,
                        gameState.versione || 0,
                        gameState.numBombe || 0,
                        gameState.inGioco || false
                    );
                    break;
                case 'rischio_estremo':
                    shouldUnlock = achievement.check(gameState.numBombe || 0, gameState.inGioco || false);
                    break;
                case 'serie_10':
                    shouldUnlock = achievement.check(streak);
                    break;
                case 'cashout_veloce':
                    shouldUnlock = achievement.check(gameState.trovati || 0, gameState.inGioco || false);
                    break;
            }

            if (shouldUnlock) {
                unlocked.push(achievement.id);
                salvaAchievements(unlocked);
                showAchievementUnlocked(achievement);
                updateAchievementsButton();
            }
        }
    });
}

// Mostra notifica obiettivo sbloccato
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

// Aggiorna il contatore sul pulsante obiettivi
export function updateAchievementsButton() {
    const unlocked = caricaAchievements();
    const button = document.getElementById('achievementsButton');

    if (button) {
        button.setAttribute('data-count', unlocked.length);
    }
}

// Renderizza la lista degli obiettivi
export function renderAchievements(gameState = {}) {
    const unlocked = caricaAchievements();
    const stats = caricaStatistiche();
    const streak = getStreak();
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
        let isCloseToUnlock = false;

        if (!isUnlocked) {
            // Verifica se l'obiettivo è vicino ad essere sbloccato
            switch (achievement.id) {
                case 'prima_vittoria':
                    isCloseToUnlock = stats.partiteVinte === 0 && stats.partiteGiocate > 0;
                    break;
                case 'combo_5':
                    isCloseToUnlock = (gameState.trovati || 0) >= 3 && gameState.inGioco;
                    break;
                case 'vincita_1000':
                    isCloseToUnlock = stats.vincitaMassima >= 500;
                    break;
                case 'griglia_completa':
                    isCloseToUnlock = gameState.versione === 3 && (gameState.trovati || 0) >= 15;
                    break;
                case 'rischio_estremo':
                    isCloseToUnlock = (gameState.numBombe || 0) >= 7;
                    break;
                case 'serie_10':
                    isCloseToUnlock = streak >= 5;
                    break;
                case 'partite_50':
                    isCloseToUnlock = stats.partiteGiocate >= 30;
                    break;
                case 'partite_100':
                    isCloseToUnlock = stats.partiteGiocate >= 70;
                    break;
                case 'profitto_5000':
                    isCloseToUnlock = (stats.totaleVinto - stats.totaleScommesso) >= 2500;
                    break;
            }
        }

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
