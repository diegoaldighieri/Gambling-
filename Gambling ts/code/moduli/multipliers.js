// ===== GESTIONE MOLTIPLICATORI =====

import { moltiplicatoriTabelle, levels } from './config.js';
import { getPlayerLevel } from './levels.js';

// Ottieni il moltiplicatore per numero di diamanti trovati
export function getMoltiplicatorePerDiamanti(diamantiTrovati, totaleCelle, numBombe) {
    if (diamantiTrovati === 0) return 1.00;

    const key = `${totaleCelle}_${numBombe}`;
    const tabella = moltiplicatoriTabelle[key];

    if (!tabella) {
        // Calcolo dinamico se non c'è tabella
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

// Calcola il moltiplicatore finale con bonus livello
export function calcolaMoltiplicatoreFinale(moltiplicatoreBase) {
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    return moltiplicatoreBase * levelMultiplier;
}

// Aggiorna l'UI del moltiplicatore
export function aggiornaMoltiplicatore(cmoltiplicatore, totalescommessa, trovati, totaleCelle, numBombe, inGioco) {
    const moltiplicatoreEl = document.getElementById("moltiplicatore");
    const vincitaEl = document.getElementById("vincita");
    const celleSicureEl = document.getElementById("celleSicure");
    const totaleCelleEl = document.getElementById("totaleCelle");

    const finalMultiplier = calcolaMoltiplicatoreFinale(cmoltiplicatore);

    moltiplicatoreEl.textContent = finalMultiplier.toFixed(2);
    vincitaEl.textContent = Math.floor(totalescommessa * finalMultiplier);

    const celleSicureTotali = totaleCelle - numBombe;
    celleSicureEl.textContent = trovati;
    totaleCelleEl.textContent = celleSicureTotali;

    // Animazione pulse
    if (inGioco && cmoltiplicatore > 1) {
        moltiplicatoreEl.parentElement.classList.add('pulse');
        vincitaEl.parentElement.classList.add('pulse');

        setTimeout(() => {
            moltiplicatoreEl.parentElement.classList.remove('pulse');
            vincitaEl.parentElement.classList.remove('pulse');
        }, 500);
    }
}
