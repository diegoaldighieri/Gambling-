// ===== GESTIONE STATISTICHE =====

import { caricaStatistiche, salvaStatistiche, setLastKnownLevel } from './storage.js';
import { checkLevelUp } from './levels.js';
import { checkAchievements } from './achievements.js';
import { showNotification } from './audio.js';

// Aggiorna le statistiche dopo una partita
export function aggiornaStatistiche(tipo, importo, totalescommessa) {
    const stats = caricaStatistiche();

    stats.partiteGiocate++;
    stats.totaleScommesso += totalescommessa;

    if (tipo === 'vinta') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    } else if (tipo === 'persa') {
        stats.partitePerse++;
        stats.ultimaVincita = -totalescommessa;

        if (totalescommessa > stats.perditaMassima) {
            stats.perditaMassima = totalescommessa;
        }
    } else if (tipo === 'cashout') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    }

    salvaStatistiche(stats);
    aggiornaUIStatistiche();
    checkLevelUp();
    checkAchievements();
}

// Aggiorna l'UI con le statistiche
export function aggiornaUIStatistiche() {
    const stats = caricaStatistiche();

    document.getElementById('partiteGiocate').textContent = stats.partiteGiocate;
    document.getElementById('partiteVinte').textContent = stats.partiteVinte;
    document.getElementById('partitePerse').textContent = stats.partitePerse;
    document.getElementById('totaleScommesso').textContent = stats.totaleScommesso;
    document.getElementById('totaleVinto').textContent = stats.totaleVinto;
    document.getElementById('vincitaMassima').textContent = stats.vincitaMassima;
    document.getElementById('perditaMassima').textContent = stats.perditaMassima;

    const ultimaVincitaEl = document.getElementById('ultimaVincita');
    ultimaVincitaEl.textContent = stats.ultimaVincita;

    if (stats.ultimaVincita > 0) {
        ultimaVincitaEl.style.color = '#00cc66';
    } else if (stats.ultimaVincita < 0) {
        ultimaVincitaEl.style.color = '#ef4444';
    } else {
        ultimaVincitaEl.style.color = 'var(--color-primary)';
    }

    const percVittorie = stats.partiteGiocate > 0
        ? ((stats.partiteVinte / stats.partiteGiocate) * 100).toFixed(1)
        : 0;
    document.getElementById('percVittorie').textContent = percVittorie;

    const profittoNetto = stats.totaleVinto - stats.totaleScommesso;
    const profittoNettoEl = document.getElementById('profittoNetto');
    profittoNettoEl.textContent = profittoNetto;

    if (profittoNetto > 0) {
        profittoNettoEl.style.color = '#00cc66';
    } else if (profittoNetto < 0) {
        profittoNettoEl.style.color = '#ef4444';
    } else {
        profittoNettoEl.style.color = 'var(--color-primary)';
    }
}

// Resetta tutte le statistiche
export function resetStatistiche() {
    if (confirm('Sei sicuro di voler resettare tutte le statistiche?')) {
        const statsVuote = {
            partiteGiocate: 0,
            partiteVinte: 0,
            partitePerse: 0,
            totaleScommesso: 0,
            totaleVinto: 0,
            ultimaVincita: 0,
            vincitaMassima: 0,
            perditaMassima: 0
        };
        salvaStatistiche(statsVuote);
        aggiornaUIStatistiche();

        // Reset anche livello
        setLastKnownLevel(1);
        
        // Importa e chiama updateLevelDisplay (sarà disponibile nel main)
        if (window.updateLevelDisplay) {
            window.updateLevelDisplay();
        }

        showNotification('Statistiche resettate!', 'success');
    }
}

// Esporta le statistiche in JSON
export function esportaStatistiche(getCaramelle, caricaTema, getPlayerLevel) {
    const data = {
        balance: getCaramelle(),
        stats: caricaStatistiche(),
        achievements: require('./storage.js').caricaAchievements(),
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
