// ===== GESTIONE MOLTIPLICATORI - FIXED =====

import { moltiplicatoriTabelle, levels } from './config.js';
import { getPlayerLevel } from './levels.js';

// FIX: Ottieni il moltiplicatore per numero di diamanti trovati
export function getMoltiplicatorePerDiamanti(diamantiTrovati, totaleCelle, numBombe) {
    if (diamantiTrovati === 0) return 1.00;

    const key = `${totaleCelle}_${numBombe}`;
    const tabella = moltiplicatoriTabelle[key];

    if (!tabella) {
        // Calcolo dinamico se non c'è tabella
        const celleRimaste = totaleCelle - diamantiTrovati;
        const bombeRimaste = numBombe;
        const celleSicure = celleRimaste - bombeRimaste;

        if (celleSicure <= 0) {
            // Se non ci sono più celle sicure, sei arrivato alla fine
            return getMoltiplicatorePerDiamanti(diamantiTrovati - 1, totaleCelle, numBombe) * 1.5;
        }

        const probabilitaSicura = celleSicure / celleRimaste;
        const moltiplicatore = 1 / probabilitaSicura;

        return parseFloat(moltiplicatore.toFixed(2));
    }

    // FIX: Usa l'indice corretto (diamantiTrovati - 1)
    const index = diamantiTrovati - 1;

    if (index >= tabella.length) {
        // Se superi la tabella, usa l'ultimo valore
        return tabella[tabella.length - 1];
    }

    return tabella[index];
}

// Calcola il moltiplicatore finale con bonus livello
export function calcolaMoltiplicatoreFinale(moltiplicatoreBase) {
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    return moltiplicatoreBase * levelMultiplier;
}

// FIX: Aggiorna l'UI del moltiplicatore
export function aggiornaMoltiplicatore(moltiplicatoreTotale, totalescommessa, trovati, totaleCelle, numBombe, inGioco) {
    const moltiplicatoreEl = document.getElementById("moltiplicatore");
    const vincitaEl = document.getElementById("vincita");
    const celleSicureEl = document.getElementById("celleSicure");
    const totaleCelleEl = document.getElementById("totaleCelle");

    if (!moltiplicatoreEl || !vincitaEl) return;

    // FIX: Usa il moltiplicatore totale passato come parametro
    moltiplicatoreEl.textContent = moltiplicatoreTotale.toFixed(2) + 'x';

    // FIX: Calcola correttamente la vincita potenziale
    const vincitaPotenziale = Math.floor(totalescommessa * moltiplicatoreTotale);
    vincitaEl.textContent = vincitaPotenziale;

    if (celleSicureEl && totaleCelleEl) {
        const celleSicureTotali = totaleCelle - numBombe;
        celleSicureEl.textContent = trovati;
        totaleCelleEl.textContent = celleSicureTotali;
    }

    // Animazione pulse
    if (inGioco && moltiplicatoreTotale > 1) {
        moltiplicatoreEl.parentElement?.classList.add('pulse');
        vincitaEl.parentElement?.classList.add('pulse');

        setTimeout(() => {
            moltiplicatoreEl.parentElement?.classList.remove('pulse');
            vincitaEl.parentElement?.classList.remove('pulse');
        }, 500);
    }
}
