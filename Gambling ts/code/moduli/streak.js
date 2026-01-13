// ===== GESTIONE STREAK =====

import { getStreak, setStreak } from './storage.js';
import { showNotification } from './audio.js';

// Aggiorna la serie di vittorie
export function updateStreak(won) {
    let streak = getStreak();

    if (won) {
        streak++;
        setStreak(streak);

        // Mostra notifica ogni 5 vittorie consecutive
        if (streak >= 5 && streak % 5 === 0) {
            showNotification(`🔥 Serie di ${streak} vittorie!`, 'success');
        }
    } else {
        setStreak(0);
    }

    return streak;
}

// Ottieni la serie corrente
export function getCurrentStreak() {
    return getStreak();
}
