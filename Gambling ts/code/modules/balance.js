// ===== GESTIONE SALDO =====

import { salvaCaramelle, caricaCaramelle } from './storage.js';
import { animateValue } from './utils.js';

// Ottieni il saldo corrente
export function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

// Imposta il saldo con animazione
export function setCaramelle(n) {
    if (n < 0) n = 0;
    const oldValue = getCaramelle();
    animateValue(document.getElementById("caramelle"), oldValue, n, 500);
    salvaCaramelle(n);
}

// Inizializza il saldo dal storage
export function inizializzaSaldo() {
    const saldo = caricaCaramelle();
    document.getElementById("caramelle").textContent = saldo;
}
