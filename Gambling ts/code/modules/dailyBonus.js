// ===== DAILY BONUS =====

import { getLastLogin, setLastLogin } from './storage.js';
import { getCaramelle, setCaramelle } from './balance.js';
import { playSound } from './audio.js';

// Verifica e mostra il bonus giornaliero
export function checkDailyBonus() {
    const lastLogin = getLastLogin();
    const today = new Date().toDateString();

    if (lastLogin !== today) {
        const bonus = 100;
        setCaramelle(getCaramelle() + bonus);
        document.getElementById('dailyBonusAmount').textContent = bonus;
        document.getElementById('dailyBonusPopup').style.display = 'flex';
        setLastLogin(today);
        playSound('win');
    }
}

// Chiudi popup bonus giornaliero
export function closeDailyBonus() {
    document.getElementById('dailyBonusPopup').style.display = 'none';
}
