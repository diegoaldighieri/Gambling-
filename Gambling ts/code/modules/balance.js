// ===== GESTIONE SALDO CON ANTI-CHEAT =====

import { salvaCaramelle, caricaCaramelle } from './storage.js';
import { animateValue } from './utils.js';
import { AntiCheat } from './antiCheat.js';

// Variabile per sincronizzazione
let balanceInitialized = false;

// Ottieni il saldo corrente (con validazione)
export function getCaramelle() {
    const displayValue = parseInt(document.getElementById("caramelle").textContent) || 0;

    // Verifica coerenza con storage sicuro
    if (balanceInitialized) {
        const secureValue = AntiCheat.getBalance(500);

        // Se c'è discrepanza, usa valore sicuro
        if (Math.abs(displayValue - secureValue) > 1) {
            console.warn('⚠️ Balance mismatch detected, using secure value');
            document.getElementById("caramelle").textContent = secureValue;
            return secureValue;
        }
    }

    return displayValue;
}

// Imposta il saldo con animazione e validazione
export function setCaramelle(n) {
    // Validazione input
    if (typeof n !== 'number' || isNaN(n) || !isFinite(n)) {
        console.error('⚠️ Invalid balance value:', n);
        return false;
    }

    // Limita range
    if (n < 0) n = 0;
    if (n > 999999999) n = 999999999;

    // Arrotonda a intero
    n = Math.floor(n);

    const oldValue = getCaramelle();

    // Salva in modo sicuro
    if (!AntiCheat.setBalance(n)) {
        console.error('⚠️ Failed to save balance securely');
        return false;
    }

    // Salva anche nel vecchio storage (per compatibilità)
    salvaCaramelle(n);

    // Anima UI
    animateValue(document.getElementById("caramelle"), oldValue, n, 500);

    return true;
}

// Inizializza il saldo dal storage sicuro
export function inizializzaSaldo() {
    // Prova a caricare da storage sicuro
    const secureBalance = AntiCheat.getBalance(null);

    if (secureBalance !== null) {
        // Usa balance sicuro
        document.getElementById("caramelle").textContent = secureBalance;
        balanceInitialized = true;
    } else {
        // Migra da vecchio storage
        const oldBalance = caricaCaramelle();
        document.getElementById("caramelle").textContent = oldBalance;

        // Salva in storage sicuro
        AntiCheat.setBalance(oldBalance);
        balanceInitialized = true;
    }

    console.log('💰 Balance initialized:', getCaramelle());
}

// Aggiungi al saldo
export function aggiungiCaramelle(amount) {
    const current = getCaramelle();
    const newBalance = current + amount;
    return setCaramelle(newBalance);
}

// Sottrai dal saldo
export function sottraiCaramelle(amount) {
    const current = getCaramelle();
    const newBalance = current - amount;
    return setCaramelle(newBalance);
}

// Verifica se ha abbastanza saldo
export function hasSaldoSufficiente(amount) {
    return getCaramelle() >= amount;
}
