// ===== SISTEMA SFIDE E MULTIPLAYER =====

import { storage } from './storage.js';
import { showNotification, playSound } from './audio.js';
import { getNickname, getAvatar } from './leaderboard.js';

// Tipi di sfida
const tipiSfida = {
    vincita_massima: {
        nome: 'Vincita Massima',
        descrizione: 'Chi ottiene la vincita più alta vince',
        icona: '💰',
        durata: 5 // minuti
    },
    piu_diamanti: {
        nome: 'Più Diamanti',
        descrizione: 'Chi trova più diamanti vince',
        icona: '💎',
        durata: 5
    },
    tempo_record: {
        nome: 'Tempo Record',
        descrizione: 'Chi vince nel minor tempo',
        icona: '⏱️',
        durata: 3
    },
    serie_vittorie: {
        nome: 'Serie Vittorie',
        descrizione: 'Chi fa la serie più lunga vince',
        icona: '🔥',
        durata: 10
    }
};

// Stato sfide attive
let sfideAttive = [];
let sfidaCorrente = null;

// ===== GESTIONE SFIDE =====

// Crea nuova sfida
export function creaSfida(tipo, avversario = 'CPU') {
    const tipoSfida = tipiSfida[tipo];
    if (!tipoSfida) return null;

    const sfida = {
        id: generateSfidaId(),
        tipo,
        nome: tipoSfida.nome,
        descrizione: tipoSfida.descrizione,
        icona: tipoSfida.icona,
        creatore: {
            nickname: getNickname(),
            avatar: getAvatar()
        },
        avversario: avversario === 'CPU' ? {
            nickname: 'CPU',
            avatar: '🤖',
            difficolta: 'medio'
        } : avversario,
        dataInizio: Date.now(),
        dataFine: Date.now() + (tipoSfida.durata * 60 * 1000),
        stato: 'attiva',
        punteggi: {
            creatore: 0,
            avversario: 0
        }
    };

    sfideAttive.push(sfida);
    salvaSfide();
    
    showNotification(`⚔️ Sfida creata: ${tipoSfida.nome}!`, 'success');
    return sfida;
}

// Accetta sfida
export function accettaSfida(sfidaId) {
    const sfida = sfideAttive.find(s => s.id === sfidaId);
    if (!sfida) return false;

    sfida.avversario = {
        nickname: getNickname(),
        avatar: getAvatar()
    };
    sfida.stato = 'in_corso';
    
    salvaSfide();
    iniziaSfida(sfida);
    
    return true;
}

// Inizia sfida
export function iniziaSfida(sfida) {
    sfidaCorrente = sfida;
    
    // Mostra UI sfida
    mostraUISfida(sfida);
    
    // Avvia timer
    avviaTimerSfida(sfida);
    
    showNotification(`⚔️ Sfida iniziata: ${sfida.nome}!`, 'info');
    playSound('levelup');
}

// Aggiorna punteggio sfida
export function aggiornaPunteggioSfida(valore) {
    if (!sfidaCorrente) return;

    switch (sfidaCorrente.tipo) {
        case 'vincita_massima':
            if (valore > sfidaCorrente.punteggi.creatore) {
                sfidaCorrente.punteggi.creatore = valore;
            }
            break;
        case 'piu_diamanti':
            sfidaCorrente.punteggi.creatore += valore;
            break;
        case 'serie_vittorie':
            sfidaCorrente.punteggi.creatore = valore;
            break;
    }

    // Simula punteggio CPU
    if (sfidaCorrente.avversario.nickname === 'CPU') {
        simulaPunteggioCPU();
    }

    aggiornaUISfida();
    salvaSfide();
}

// Simula punteggio CPU
function simulaPunteggioCPU() {
    if (!sfidaCorrente) return;

    const difficolta = sfidaCorrente.avversario.difficolta || 'medio';
    let moltiplicatore = 0.7;

    switch (difficolta) {
        case 'facile':
            moltiplicatore = 0.5;
            break;
        case 'medio':
            moltiplicatore = 0.8;
            break;
        case 'difficile':
            moltiplicatore = 1.0;
            break;
        case 'impossibile':
            moltiplicatore = 1.2;
            break;
    }

    // Punteggio CPU = punteggio giocatore * moltiplicatore + randomness
    const baseCPU = sfidaCorrente.punteggi.creatore * moltiplicatore;
    const varianza = baseCPU * 0.2;
    sfidaCorrente.punteggi.avversario = Math.floor(
        baseCPU + (Math.random() - 0.5) * varianza
    );
}

// Termina sfida
export function terminaSfida(sfida = sfidaCorrente) {
    if (!sfida) return;

    sfida.stato = 'completata';
    
    // Determina vincitore
    const vincitore = sfida.punteggi.creatore > sfida.punteggi.avversario 
        ? 'creatore' 
        : 'avversario';

    const haVinto = vincitore === 'creatore';
    
    mostraRisultatoSfida(sfida, vincitore, haVinto);
    
    // Salva risultato
    salvaRisultatoSfida(sfida, haVinto);
    
    sfidaCorrente = null;
    salvaSfide();
}

// Mostra risultato sfida
function mostraRisultatoSfida(sfida, vincitore, haVinto) {
    const popup = document.createElement('div');
    popup.className = 'sfida-risultato-popup';
    popup.innerHTML = `
        <div class="sfida-risultato-content">
            <h2>${haVinto ? '🏆 VITTORIA!' : '💔 SCONFITTA'}</h2>
            <div class="sfida-punteggi-finali">
                <div class="giocatore ${vincitore === 'creatore' ? 'vincitore' : ''}">
                    <div class="avatar">${sfida.creatore.avatar}</div>
                    <div class="nickname">${sfida.creatore.nickname}</div>
                    <div class="punteggio">${sfida.punteggi.creatore}</div>
                </div>
                <div class="vs">VS</div>
                <div class="giocatore ${vincitore === 'avversario' ? 'vincitore' : ''}">
                    <div class="avatar">${sfida.avversario.avatar}</div>
                    <div class="nickname">${sfida.avversario.nickname}</div>
                    <div class="punteggio">${sfida.punteggi.avversario}</div>
                </div>
            </div>
            ${haVinto ? '<div class="ricompensa">+500💵 Ricompensa!</div>' : ''}
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(popup);
    
    playSound(haVinto ? 'win' : 'bomb');
}

// Salva risultato sfida
function salvaRisultatoSfida(sfida, haVinto) {
    const storico = storage.get('storicoSfide', []);
    storico.push({
        ...sfida,
        haVinto,
        completataIl: Date.now()
    });
    storage.set('storicoSfide', storico.slice(-50)); // Mantieni ultime 50
}

// ===== SFIDE GIORNALIERE =====

export function getSfidaGiornaliera() {
    const oggi = new Date().toDateString();
    const sfidaGiornaliera = storage.get('sfidaGiornaliera', {});

    if (sfidaGiornaliera.data !== oggi) {
        // Genera nuova sfida giornaliera
        const tipi = Object.keys(tipiSfida);
        const tipoRandom = tipi[Math.floor(Math.random() * tipi.length)];
        
        const nuovaSfida = {
            data: oggi,
            tipo: tipoRandom,
            obiettivo: generaObiettivoSfidaGiornaliera(tipoRandom),
            completata: false,
            ricompensa: 300
        };

        storage.set('sfidaGiornaliera', nuovaSfida);
        return nuovaSfida;
    }

    return sfidaGiornaliera;
}

function generaObiettivoSfidaGiornaliera(tipo) {
    switch (tipo) {
        case 'vincita_massima':
            return 500 + Math.floor(Math.random() * 500);
        case 'piu_diamanti':
            return 20 + Math.floor(Math.random() * 10);
        case 'serie_vittorie':
            return 3 + Math.floor(Math.random() * 3);
        default:
            return 100;
    }
}

export function controllaSfidaGiornaliera(tipo, valore) {
    const sfida = getSfidaGiornaliera();
    
    if (sfida.completata || sfida.tipo !== tipo) return;

    if (valore >= sfida.obiettivo) {
        sfida.completata = true;
        storage.set('sfidaGiornaliera', sfida);
        
        showNotification(
            `🎯 Sfida Giornaliera Completata! +${sfida.ricompensa}💵`,
            'success',
            5000
        );
        playSound('win');
    }
}

// ===== UI SFIDE =====

function mostraUISfida(sfida) {
    let container = document.getElementById('sfidaContainer');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'sfidaContainer';
        container.className = 'sfida-container';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="sfida-header">
            <div class="sfida-tipo">${sfida.icona} ${sfida.nome}</div>
            <div class="sfida-timer" id="sfidaTimer">5:00</div>
        </div>
        <div class="sfida-punteggi">
            <div class="giocatore">
                <div class="avatar">${sfida.creatore.avatar}</div>
                <div class="nickname">${sfida.creatore.nickname}</div>
                <div class="punteggio" id="punteggioCreatore">0</div>
            </div>
            <div class="vs">VS</div>
            <div class="giocatore">
                <div class="avatar">${sfida.avversario.avatar}</div>
                <div class="nickname">${sfida.avversario.nickname}</div>
                <div class="punteggio" id="punteggioAvversario">0</div>
            </div>
        </div>
    `;

    container.style.display = 'block';
}

function aggiornaUISfida() {
    if (!sfidaCorrente) return;

    const creatoreEl = document.getElementById('punteggioCreatore');
    const avversarioEl = document.getElementById('punteggioAvversario');

    if (creatoreEl) creatoreEl.textContent = sfidaCorrente.punteggi.creatore;
    if (avversarioEl) avversarioEl.textContent = sfidaCorrente.punteggi.avversario;
}

function avviaTimerSfida(sfida) {
    const timerEl = document.getElementById('sfidaTimer');
    if (!timerEl) return;

    const interval = setInterval(() => {
        const tempoRimasto = sfida.dataFine - Date.now();
        
        if (tempoRimasto <= 0) {
            clearInterval(interval);
            terminaSfida(sfida);
            return;
        }

        const minuti = Math.floor(tempoRimasto / 60000);
        const secondi = Math.floor((tempoRimasto % 60000) / 1000);
        timerEl.textContent = `${minuti}:${secondi.toString().padStart(2, '0')}`;

        if (tempoRimasto <= 10000) {
            timerEl.classList.add('urgent');
        }
    }, 1000);
}

// ===== STORICO E STATISTICHE =====

export function getStoricoSfide() {
    return storage.get('storicoSfide', []);
}

export function getStatisticheSfide() {
    const storico = getStoricoSfide();
    
    return {
        totali: storico.length,
        vinte: storico.filter(s => s.haVinto).length,
        perse: storico.filter(s => !s.haVinto).length,
        percVittorie: storico.length > 0 
            ? ((storico.filter(s => s.haVinto).length / storico.length) * 100).toFixed(1)
            : 0
    };
}

// ===== UTILITY =====

function generateSfidaId() {
    return `sfida_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function salvaSfide() {
    storage.set('sfideAttive', sfideAttive);
}

function caricaSfide() {
    sfideAttive = storage.get('sfideAttive', []);
    
    // Rimuovi sfide scadute
    sfideAttive = sfideAttive.filter(s => s.dataFine > Date.now());
    salvaSfide();
}

// ===== MODAL SFIDE =====

export function setupSfideModal() {
    const button = document.getElementById('sfideButton');
    const modal = document.getElementById('sfideModal');
    const closeBtn = document.getElementById('closeSfide');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderSfide();
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

function renderSfide() {
    const container = document.getElementById('sfideList');
    if (!container) return;

    const sfidaGiornaliera = getSfidaGiornaliera();
    const stats = getStatisticheSfide();

    container.innerHTML = `
        <div class="sfide-stats">
            <div class="stat">Vinte: ${stats.vinte}</div>
            <div class="stat">Perse: ${stats.perse}</div>
            <div class="stat">% Vittorie: ${stats.percVittorie}%</div>
        </div>

        <h3>🎯 Sfida Giornaliera</h3>
        <div class="sfida-giornaliera ${sfidaGiornaliera.completata ? 'completata' : ''}">
            <div class="sfida-nome">${tipiSfida[sfidaGiornaliera.tipo].nome}</div>
            <div class="sfida-obiettivo">
                Obiettivo: ${sfidaGiornaliera.obiettivo}
            </div>
            <div class="sfida-ricompensa">+${sfidaGiornaliera.ricompensa}💵</div>
        </div>

        <h3>⚔️ Nuova Sfida</h3>
        <div class="sfide-crea">
            ${Object.keys(tipiSfida).map(tipo => `
                <button class="sfida-tipo-btn" onclick="window.creaSfidaVsCPU('${tipo}')">
                    ${tipiSfida[tipo].icona} ${tipiSfida[tipo].nome}
                </button>
            `).join('')}
        </div>
    `;
}

// Esporta funzioni globali
window.creaSfidaVsCPU = (tipo) => {
    creaSfida(tipo, 'CPU');
    document.getElementById('sfideModal').style.display = 'none';
};

// Inizializza
caricaSfide();

// Esporta
export { sfideAttive, sfidaCorrente, tipiSfida };
