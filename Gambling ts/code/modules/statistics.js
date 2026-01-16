// ===== GESTIONE STATISTICHE CON ANTI-CHEAT =====

import { caricaStatistiche, salvaStatistiche, setLastKnownLevel } from './storage.js';
import { checkLevelUp } from './levels.js';
import { checkAchievements } from './achievements.js';
import { showNotification } from './audio.js';
import { AntiCheat } from './antiCheat.js';

// Validazione statistiche
function validateStats(stats) {
    if (!stats || typeof stats !== 'object') return false;

    const requiredFields = [
        'partiteGiocate', 'partiteVinte', 'partitePerse',
        'totaleScommesso', 'totaleVinto', 'ultimaVincita',
        'vincitaMassima', 'perditaMassima'
    ];

    for (const field of requiredFields) {
        if (!(field in stats)) return false;
        if (typeof stats[field] !== 'number') return false;
        if (isNaN(stats[field]) || !isFinite(stats[field])) return false;
    }

    // Validazione logica
    if (stats.partiteGiocate < 0) return false;
    if (stats.partiteVinte + stats.partitePerse > stats.partiteGiocate) return false;
    if (stats.totaleScommesso < 0 || stats.totaleVinto < 0) return false;
    if (stats.vincitaMassima < 0 || stats.perditaMassima < 0) return false;

    return true;
}

// Aggiorna le statistiche dopo una partita con validazione
export function aggiornaStatistiche(tipo, importo, totalescommessa) {
    const stats = caricaStatistiche();

    // Validazione input
    if (typeof importo !== 'number' || isNaN(importo) || !isFinite(importo)) {
        console.error('⚠️ Invalid winning amount:', importo);
        return false;
    }

    if (typeof totalescommessa !== 'number' || isNaN(totalescommessa) || !isFinite(totalescommessa)) {
        console.error('⚠️ Invalid bet amount:', totalescommessa);
        return false;
    }

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

    // Validazione finale
    if (!validateStats(stats)) {
        console.error('⚠️ Stats validation failed after update');
        return false;
    }

    // Salva in modo sicuro
    salvaStatistiche(stats);
    aggiornaUIStatistiche();
    checkLevelUp();
    checkAchievements();

    return true;
}

// Aggiorna l'UI con le statistiche
export function aggiornaUIStatistiche() {
    const stats = caricaStatistiche();

    // Validazione prima di mostrare
    if (!validateStats(stats)) {
        console.warn('⚠️ Invalid stats detected, using defaults');
        const defaultStats = {
            partiteGiocate: 0,
            partiteVinte: 0,
            partitePerse: 0,
            totaleScommesso: 0,
            totaleVinto: 0,
            ultimaVincita: 0,
            vincitaMassima: 0,
            perditaMassima: 0
        };
        salvaStatistiche(defaultStats);
        return;
    }

    // Aggiorna UI in modo sicuro
    const safeSet = (id, value) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    };

    safeSet('partiteGiocate', stats.partiteGiocate);
    safeSet('partiteVinte', stats.partiteVinte);
    safeSet('partitePerse', stats.partitePerse);
    safeSet('totaleScommesso', stats.totaleScommesso);
    safeSet('totaleVinto', stats.totaleVinto);
    safeSet('vincitaMassima', stats.vincitaMassima);
    safeSet('perditaMassima', stats.perditaMassima);

    const ultimaVincitaEl = document.getElementById('ultimaVincita');
    if (ultimaVincitaEl) {
        ultimaVincitaEl.textContent = stats.ultimaVincita;

        if (stats.ultimaVincita > 0) {
            ultimaVincitaEl.style.color = '#00cc66';
        } else if (stats.ultimaVincita < 0) {
            ultimaVincitaEl.style.color = '#ef4444';
        } else {
            ultimaVincitaEl.style.color = 'var(--color-primary)';
        }
    }

    const percVittorie = stats.partiteGiocate > 0
        ? ((stats.partiteVinte / stats.partiteGiocate) * 100).toFixed(1)
        : 0;
    safeSet('percVittorie', percVittorie);

    const profittoNetto = stats.totaleVinto - stats.totaleScommesso;
    const profittoNettoEl = document.getElementById('profittoNetto');
    if (profittoNettoEl) {
        profittoNettoEl.textContent = profittoNetto;

        if (profittoNetto > 0) {
            profittoNettoEl.style.color = '#00cc66';
        } else if (profittoNetto < 0) {
            profittoNettoEl.style.color = '#ef4444';
        } else {
            profittoNettoEl.style.color = 'var(--color-primary)';
        }
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

        // Chiama updateLevelDisplay se disponibile
        if (window.updateLevelDisplay) {
            window.updateLevelDisplay();
        }

        showNotification('Statistiche resettate!', 'success');
    }
}

// Esporta le statistiche in JSON con validazione
export function esportaStatistiche(getCaramelle, caricaTema, getPlayerLevel) {
    const stats = caricaStatistiche();

    // Validazione prima dell'export
    if (!validateStats(stats)) {
        showNotification('❌ Errore: statistiche corrotte', 'error');
        return;
    }

    const data = {
        version: '4.0',
        exportDate: new Date().toISOString(),
        balance: getCaramelle(),
        stats: stats,
        level: getPlayerLevel(),
        theme: caricaTema(),
        integrity: AntiCheat.verifyIntegrity(),
        timestamp: Date.now()
    };

    try {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `caccia-tesoro-backup-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showNotification('💾 Dati esportati con successo!', 'success');
    } catch (e) {
        console.error('Export error:', e);
        showNotification('❌ Errore durante l\'export', 'error');
    }
}

// Importa statistiche con validazione
export function importaStatistiche(fileData) {
    try {
        const data = JSON.parse(fileData);

        // Validazione dati importati
        if (!data.stats || !validateStats(data.stats)) {
            throw new Error('Invalid stats data');
        }

        if (confirm('Importare questi dati? I dati correnti saranno sovrascritti.')) {
            salvaStatistiche(data.stats);
            aggiornaUIStatistiche();
            showNotification('✅ Dati importati con successo!', 'success');

            // Ricarica pagina per applicare tutte le modifiche
            setTimeout(() => window.location.reload(), 1000);
        }
    } catch (e) {
        console.error('Import error:', e);
        showNotification('❌ File non valido o corrotto', 'error');
    }
}
