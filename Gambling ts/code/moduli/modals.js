// ===== GESTIONE MODALI =====

import { playSound, showNotification } from './audio.js';
import { aggiornaUIStatistiche, resetStatistiche } from './statistics.js';
import { renderAchievements } from './achievements.js';
import { caricaStatistiche, caricaAchievements } from './storage.js';
import { getCaramelle } from './balance.js';
import { caricaTema } from './storage.js';
import { getPlayerLevel } from './levels.js';

export function setupModals() {
    // Stats Modal
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
        exportStatistiche();
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
}

function exportStatistiche() {
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
}
