// ===== MODALITÀ DI GIOCO ALTERNATIVE =====

import { storage } from './storage.js';
import { showNotification, playSound } from './audio.js';
import { getCaramelle, setCaramelle } from './balance.js';

// Stato modalità corrente
let modalitaCorrente = 'classica';
let statoModalita = {};

// Definizione modalità
const modalita = {
    classica: {
        nome: 'Classica',
        descrizione: 'La modalità standard del gioco',
        icona: '💎',
        sbloccata: true
    },
    timeAttack: {
        nome: 'Time Attack',
        descrizione: '60 secondi per trovare più diamanti possibile',
        icona: '⏱️',
        sbloccata: true,
        tempoiniziale: 60,
        bonusTempo: 5 // Secondi bonus per diamante
    },
    survival: {
        nome: 'Sopravvivenza',
        descrizione: 'Partite consecutive senza perdere',
        icona: '🛡️',
        sbloccata: true,
        vite: 3
    },
    endless: {
        nome: 'Infinita',
        descrizione: 'Continua finché non colpisci una bomba',
        icona: '♾️',
        sbloccata: true,
        moltiplicatoreProgressivo: 0.1 // +10% ogni 5 diamanti
    },
    puzzle: {
        nome: 'Puzzle',
        descrizione: '50+ livelli con configurazioni specifiche',
        icona: '🧩',
        sbloccata: false,
        requisitoSblocco: 'Gioca 20 partite'
    },
    boss: {
        nome: 'Boss Battle',
        descrizione: 'Sfida boss speciali ogni 10 vittorie',
        icona: '👹',
        sbloccata: false,
        requisitoSblocco: 'Vinci 10 partite consecutive'
    }
};

// Ottieni modalità corrente
export function getModalitaCorrente() {
    return modalitaCorrente;
}

// Imposta modalità
export function setModalita(nomeModalita) {
    if (!modalita[nomeModalita]) {
        showNotification('❌ Modalità non valida!', 'error');
        return false;
    }

    if (!modalita[nomeModalita].sbloccata) {
        showNotification(`🔒 ${modalita[nomeModalita].requisitoSblocco}`, 'warning');
        return false;
    }

    modalitaCorrente = nomeModalita;
    statoModalita = {};
    
    // Inizializza stato specifico modalità
    if (nomeModalita === 'timeAttack') {
        statoModalita.tempoRimasto = modalita.timeAttack.tempoiniziale;
        statoModalita.diamantiTotali = 0;
    } else if (nomeModalita === 'survival') {
        statoModalita.vite = modalita.survival.vite;
        statoModalita.partiteVinte = 0;
    } else if (nomeModalita === 'endless') {
        statoModalita.diamantiTotali = 0;
        statoModalita.moltiplicatore = 1.0;
    }

    showNotification(`🎮 Modalità: ${modalita[nomeModalita].nome}`, 'info');
    return true;
}

// ===== TIME ATTACK =====
let timerInterval = null;

export function iniziaTimeAttack() {
    if (modalitaCorrente !== 'timeAttack') return;

    statoModalita.tempoRimasto = modalita.timeAttack.tempoiniziale;
    statoModalita.diamantiTotali = 0;
    
    aggiornaUITimeAttack();
    
    timerInterval = setInterval(() => {
        statoModalita.tempoRimasto--;
        aggiornaUITimeAttack();

        if (statoModalita.tempoRimasto <= 10) {
            playSound('notification');
        }

        if (statoModalita.tempoRimasto <= 0) {
            terminaTimeAttack();
        }
    }, 1000);
}

export function stopTimeAttack() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function terminaTimeAttack() {
    stopTimeAttack();
    
    const punteggio = statoModalita.diamantiTotali * 50; // 50💵 per diamante
    setCaramelle(getCaramelle() + punteggio);

    showNotification(
        `⏱️ Tempo Scaduto! ${statoModalita.diamantiTotali} diamanti trovati! +${punteggio}💵`,
        'info',
        5000
    );

    // Salva record
    const records = storage.get('timeAttackRecords', []);
    records.push({
        diamanti: statoModalita.diamantiTotali,
        punteggio,
        data: Date.now()
    });
    records.sort((a, b) => b.diamanti - a.diamanti);
    storage.set('timeAttackRecords', records.slice(0, 10));

    // Torna modalità classica
    setModalita('classica');
}

export function diamanteTrovatoTimeAttack() {
    if (modalitaCorrente !== 'timeAttack') return;
    
    statoModalita.diamantiTotali++;
    statoModalita.tempoRimasto += modalita.timeAttack.bonusTempo;
    
    aggiornaUITimeAttack();
}

function aggiornaUITimeAttack() {
    const timerEl = document.getElementById('timeAttackTimer');
    const diamantiEl = document.getElementById('timeAttackDiamanti');

    if (timerEl) {
        timerEl.textContent = `⏱️ ${statoModalita.tempoRimasto}s`;
        
        if (statoModalita.tempoRimasto <= 10) {
            timerEl.classList.add('urgent');
        } else {
            timerEl.classList.remove('urgent');
        }
    }

    if (diamantiEl) {
        diamantiEl.textContent = `💎 ${statoModalita.diamantiTotali}`;
    }
}

// ===== SURVIVAL =====
export function iniziaSurvival() {
    if (modalitaCorrente !== 'survival') return;

    statoModalita.vite = modalita.survival.vite;
    statoModalita.partiteVinte = 0;
    
    aggiornaUISurvival();
}

export function vittoriaSurvival() {
    if (modalitaCorrente !== 'survival') return;
    
    statoModalita.partiteVinte++;
    aggiornaUISurvival();
    
    if (statoModalita.partiteVinte % 5 === 0) {
        showNotification(`🏆 ${statoModalita.partiteVinte} vittorie consecutive!`, 'success');
    }
}

export function sconfittaSurvival() {
    if (modalitaCorrente !== 'survival') return;
    
    statoModalita.vite--;
    aggiornaUISurvival();

    if (statoModalita.vite <= 0) {
        terminaSurvival();
    } else {
        showNotification(`❤️ ${statoModalita.vite} vite rimaste`, 'warning');
    }
}

function terminaSurvival() {
    const punteggio = statoModalita.partiteVinte * 100;
    setCaramelle(getCaramelle() + punteggio);

    showNotification(
        `🛡️ Sopravvivenza Terminata! ${statoModalita.partiteVinte} vittorie! +${punteggio}💵`,
        'info',
        5000
    );

    // Salva record
    const records = storage.get('survivalRecords', []);
    records.push({
        vittorie: statoModalita.partiteVinte,
        punteggio,
        data: Date.now()
    });
    records.sort((a, b) => b.vittorie - a.vittorie);
    storage.set('survivalRecords', records.slice(0, 10));

    setModalita('classica');
}

function aggiornaUISurvival() {
    const viteEl = document.getElementById('survivalVite');
    const vittorieEl = document.getElementById('survivalVittorie');

    if (viteEl) {
        const viteIcone = '❤️'.repeat(statoModalita.vite) + '🖤'.repeat(modalita.survival.vite - statoModalita.vite);
        viteEl.textContent = viteIcone;
    }

    if (vittorieEl) {
        vittorieEl.textContent = `🏆 ${statoModalita.partiteVinte}`;
    }
}

// ===== ENDLESS =====
export function iniziaEndless() {
    if (modalitaCorrente !== 'endless') return;

    statoModalita.diamantiTotali = 0;
    statoModalita.moltiplicatore = 1.0;
    
    aggiornaUIEndless();
}

export function diamanteTrovatoEndless() {
    if (modalitaCorrente !== 'endless') return;
    
    statoModalita.diamantiTotali++;
    
    // Aumenta moltiplicatore ogni 5 diamanti
    if (statoModalita.diamantiTotali % 5 === 0) {
        statoModalita.moltiplicatore += modalita.endless.moltiplicatoreProgressivo;
        showNotification(`⚡ Moltiplicatore: ${statoModalita.moltiplicatore.toFixed(1)}x`, 'success');
    }
    
    aggiornaUIEndless();
}

export function terminaEndless(vincita) {
    if (modalitaCorrente !== 'endless') return;

    const bonusEndless = Math.floor(vincita * statoModalita.moltiplicatore);
    setCaramelle(getCaramelle() + bonusEndless);

    showNotification(
        `♾️ Endless Terminata! ${statoModalita.diamantiTotali} diamanti (${statoModalita.moltiplicatore.toFixed(1)}x)! +${bonusEndless}💵`,
        'info',
        5000
    );

    // Salva record
    const records = storage.get('endlessRecords', []);
    records.push({
        diamanti: statoModalita.diamantiTotali,
        moltiplicatore: statoModalita.moltiplicatore,
        punteggio: bonusEndless,
        data: Date.now()
    });
    records.sort((a, b) => b.diamanti - a.diamanti);
    storage.set('endlessRecords', records.slice(0, 10));

    setModalita('classica');
}

function aggiornaUIEndless() {
    const diamantiEl = document.getElementById('endlessDiamanti');
    const moltiplicatoreEl = document.getElementById('endlessMoltiplicatore');

    if (diamantiEl) {
        diamantiEl.textContent = `💎 ${statoModalita.diamantiTotali}`;
    }

    if (moltiplicatoreEl) {
        moltiplicatoreEl.textContent = `⚡ ${statoModalita.moltiplicatore.toFixed(1)}x`;
    }
}

// ===== PUZZLE MODE =====
const puzzleLevels = [
    {
        id: 1,
        nome: 'Principiante',
        griglia: '3x3',
        bombe: 1,
        obiettivo: 'Trova tutti i diamanti',
        stelle: 0,
        sbloccato: true
    },
    {
        id: 2,
        nome: 'Rischio Calcolato',
        griglia: '3x3',
        bombe: 2,
        obiettivo: 'Trova 5 diamanti senza cashout',
        stelle: 0,
        sbloccato: false
    },
    {
        id: 3,
        nome: 'La Croce',
        griglia: '4x4',
        bombe: 4,
        configurazione: 'bombe agli angoli',
        obiettivo: 'Completa la griglia',
        stelle: 0,
        sbloccato: false
    }
    // ... Aggiungere 50+ livelli
];

export function getPuzzleLevels() {
    const savedProgress = storage.get('puzzleProgress', {});
    
    return puzzleLevels.map(level => ({
        ...level,
        stelle: savedProgress[level.id] || 0
    }));
}

export function completaPuzzleLevel(levelId, stelle) {
    const progress = storage.get('puzzleProgress', {});
    
    if (!progress[levelId] || progress[levelId] < stelle) {
        progress[levelId] = stelle;
        storage.set('puzzleProgress', progress);
        
        // Sblocca prossimo livello
        if (levelId < puzzleLevels.length) {
            puzzleLevels[levelId].sbloccato = true;
        }
    }
}

// Renderizza selezione modalità
export function renderModalitaSelector() {
    const container = document.getElementById('modalitaSelector');
    if (!container) return;

    container.innerHTML = Object.keys(modalita).map(key => {
        const mod = modalita[key];
        return `
            <div class="modalita-card ${!mod.sbloccata ? 'locked' : ''} ${modalitaCorrente === key ? 'active' : ''}"
                 onclick="window.selectModalita('${key}')">
                <div class="modalita-icon">${mod.icona}</div>
                <div class="modalita-name">${mod.nome}</div>
                <div class="modalita-description">${mod.descrizione}</div>
                ${!mod.sbloccata ? `<div class="modalita-locked">🔒 ${mod.requisitoSblocco}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Setup modal modalità
export function setupModalitaModal() {
    const button = document.getElementById('modalitaButton');
    const modal = document.getElementById('modalitaModal');
    const closeBtn = document.getElementById('closeModalita');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderModalitaSelector();
    });

    closeBtn?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'none';
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Controlla sblocco modalità
export function checkSbloccoModalita(stats) {
    // Puzzle mode: 20 partite giocate
    if (!modalita.puzzle.sbloccata && stats.partiteGiocate >= 20) {
        modalita.puzzle.sbloccata = true;
        showNotification('🎉 Modalità Puzzle sbloccata!', 'success', 5000);
        playSound('levelup');
    }

    // Boss mode: 10 vittorie consecutive
    const streak = storage.get('currentStreak', 0);
    if (!modalita.boss.sbloccata && streak >= 10) {
        modalita.boss.sbloccata = true;
        showNotification('🎉 Modalità Boss Battle sbloccata!', 'success', 5000);
        playSound('levelup');
    }
}

// Ottieni bonus moltiplicatore modalità
export function getBonusModalita() {
    if (modalitaCorrente === 'endless' && statoModalita.moltiplicatore) {
        return statoModalita.moltiplicatore - 1.0;
    }
    return 0;
}

// Esporta stato e modalità
export { modalita, statoModalita };
