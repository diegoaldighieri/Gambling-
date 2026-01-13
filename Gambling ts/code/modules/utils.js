// ===== UTILITY FUNCTIONS =====

import { showNotification } from './audio.js';

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Animazione valore numerico
export function animateValue(element, start, end, duration) {
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

// Validazione puntata
export function validateBet(amount, balance) {
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

// Ottieni totale celle in base alla versione
export function getTotaleCelle(versione) {
    return versione === 1 ? 9 : versione === 2 ? 16 : versione === 3 ? 25 : 0;
}

// Calcola livello di rischio
export function calcolaLivelloRischio(numBombe, totaleCelle) {
    if (totaleCelle === 0) {
        return { text: "SELEZIONA GRIGLIA", className: "risk-indicator" };
    }

    const percentuale = (numBombe / totaleCelle) * 100;

    if (percentuale >= 50) {
        return { text: "ESTREMO 🔥", className: "risk-indicator risk-extreme" };
    } else if (percentuale >= 40) {
        return { text: "MOLTO ALTO ⚠️", className: "risk-indicator risk-very-high" };
    } else if (percentuale >= 30) {
        return { text: "ALTO 📈", className: "risk-indicator risk-high" };
    } else if (percentuale >= 20) {
        return { text: "MEDIO ⚖️", className: "risk-indicator risk-medium" };
    } else if (percentuale >= 10) {
        return { text: "BASSO 📉", className: "risk-indicator risk-low" };
    } else {
        return { text: "MOLTO BASSO 🛡️", className: "risk-indicator risk-very-low" };
    }
}

// Aggiorna UI del livello di rischio
export function aggiornaRischio(numBombe, totaleCelle) {
    const riskLevel = document.getElementById("riskLevel");
    const risk = calcolaLivelloRischio(numBombe, totaleCelle);
    
    riskLevel.textContent = risk.text;
    riskLevel.className = risk.className;
}

// Genera testo per condivisione risultato
export function generaTestoCondivisione(amount, versione, numBombe) {
    const grid = versione === 1 ? '3×3' : versione === 2 ? '4×4' : '5×5';
    
    return `🎮 Ho vinto ${amount}💵 su Caccia al Tesoro!\n` +
           `Griglia: ${grid} | Bombe: ${numBombe}\n` +
           `Riesci a fare di meglio? 💎`;
}

// Condividi risultato
export function shareResult(amount, versione, numBombe) {
    const text = generaTestoCondivisione(amount, versione, numBombe);

    if (navigator.share) {
        navigator.share({ text }).catch(() => {});
    } else {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('📋 Copiato negli appunti!', 'success');
        });
    }
}
