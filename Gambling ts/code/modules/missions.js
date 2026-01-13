// ===== SISTEMA MISSIONI GIORNALIERE =====

import { storage } from './storage.js';
import { showNotification, playSound } from './audio.js';
import { setCaramelle, getCaramelle } from './balance.js';
import { caricaStatistiche } from './storage.js';

// Definizione missioni disponibili
const missioniDisponibili = [
    {
        id: 'trova_5_diamanti',
        nome: 'Cacciatore Esperto',
        descrizione: 'Trova 5 diamanti in una singola partita',
        icona: '💎',
        ricompensa: 100,
        check: (progresso) => progresso.diamantiSingolaPartita >= 5
    },
    {
        id: 'vinci_3_5x5',
        nome: 'Maestro della Griglia Grande',
        descrizione: 'Vinci 3 partite sulla griglia 5×5',
        icona: '🎯',
        ricompensa: 150,
        check: (progresso) => progresso.vittorie5x5 >= 3
    },
    {
        id: 'partita_15_bombe',
        nome: 'Temerario',
        descrizione: 'Completa una partita con 15+ bombe',
        icona: '💣',
        ricompensa: 200,
        check: (progresso) => progresso.partita15Bombe
    },
    {
        id: 'tre_temi',
        nome: 'Artista',
        descrizione: 'Gioca con 3 temi diversi',
        icona: '🎨',
        ricompensa: 75,
        check: (progresso) => progresso.temiUsati.size >= 3
    },
    {
        id: 'cashout_250x',
        nome: 'Momento Perfetto',
        descrizione: 'Fai cashout esattamente a 2.50x',
        icona: '⏱️',
        ricompensa: 125,
        check: (progresso) => progresso.cashout250x
    },
    {
        id: 'vinci_senza_cashout',
        nome: 'Tutto o Niente',
        descrizione: 'Vinci una partita completa senza usare cashout',
        icona: '🏆',
        ricompensa: 100,
        check: (progresso) => progresso.vittoriaSenzaCashout
    },
    {
        id: 'serie_5',
        nome: 'Inarrestabile',
        descrizione: 'Ottieni una serie di 5 vittorie consecutive',
        icona: '🔥',
        ricompensa: 250,
        check: (progresso) => progresso.serieVittorie >= 5
    },
    {
        id: 'guadagna_500',
        nome: 'Imprenditore',
        descrizione: 'Guadagna 500💵 di profitto netto oggi',
        icona: '💰',
        ricompensa: 150,
        check: (progresso) => progresso.profittoGiornaliero >= 500
    }
];

// Ottieni missioni del giorno
export function getMissioniGiornaliere() {
    const oggi = new Date().toDateString();
    const datiMissioni = storage.get('missioniGiornaliere', {});

    // Se è un nuovo giorno, genera nuove missioni
    if (datiMissioni.data !== oggi) {
        const nuoveMissioni = generaNuoveMissioni();
        storage.set('missioniGiornaliere', {
            data: oggi,
            missioni: nuoveMissioni,
            progresso: {}
        });
        return nuoveMissioni;
    }

    return datiMissioni.missioni || [];
}

// Genera 3 missioni casuali per oggi
function generaNuoveMissioni() {
    const missioni = [...missioniDisponibili];
    const selezionate = [];

    for (let i = 0; i < 3 && missioni.length > 0; i++) {
        const index = Math.floor(Math.random() * missioni.length);
        selezionate.push({
            ...missioni[index],
            completata: false
        });
        missioni.splice(index, 1);
    }

    return selezionate;
}

// Ottieni progresso missioni
export function getProgressoMissioni() {
    const datiMissioni = storage.get('missioniGiornaliere', {});
    return datiMissioni.progresso || {};
}

// Aggiorna progresso missione
export function aggiornaProgressoMissione(tipo, valore) {
    const datiMissioni = storage.get('missioniGiornaliere', {});
    if (!datiMissioni.progresso) datiMissioni.progresso = {};

    const progresso = datiMissioni.progresso;

    switch (tipo) {
        case 'diamantiSingolaPartita':
            progresso.diamantiSingolaPartita = Math.max(progresso.diamantiSingolaPartita || 0, valore);
            break;
        case 'vittorie5x5':
            progresso.vittorie5x5 = (progresso.vittorie5x5 || 0) + 1;
            break;
        case 'partita15Bombe':
            progresso.partita15Bombe = true;
            break;
        case 'temaUsato':
            if (!progresso.temiUsati) progresso.temiUsati = new Set();
            progresso.temiUsati.add(valore);
            progresso.temiUsati = Array.from(progresso.temiUsati);
            break;
        case 'cashout250x':
            progresso.cashout250x = true;
            break;
        case 'vittoriaSenzaCashout':
            progresso.vittoriaSenzaCashout = true;
            break;
        case 'serieVittorie':
            progresso.serieVittorie = valore;
            break;
        case 'profittoGiornaliero':
            progresso.profittoGiornaliero = (progresso.profittoGiornaliero || 0) + valore;
            break;
    }

    // Converti Set in Array per serializzazione
    if (progresso.temiUsati instanceof Set) {
        progresso.temiUsati = Array.from(progresso.temiUsati);
    }

    storage.set('missioniGiornaliere', datiMissioni);

    // Controlla completamento missioni
    controllaMissioni();
}

// Controlla se missioni sono completate
function controllaMissioni() {
    const datiMissioni = storage.get('missioniGiornaliere', {});
    if (!datiMissioni.missioni) return;

    const progresso = datiMissioni.progresso || {};
    
    // Riconverti temiUsati in Set per il check
    if (Array.isArray(progresso.temiUsati)) {
        progresso.temiUsati = new Set(progresso.temiUsati);
    }

    datiMissioni.missioni.forEach(missione => {
        if (!missione.completata) {
            const missioneDefinizione = missioniDisponibili.find(m => m.id === missione.id);
            if (missioneDefinizione && missioneDefinizione.check(progresso)) {
                missione.completata = true;
                ricompensaMissione(missione);
            }
        }
    });

    // Riconverti Set in Array prima di salvare
    if (progresso.temiUsati instanceof Set) {
        progresso.temiUsati = Array.from(progresso.temiUsati);
    }

    storage.set('missioniGiornaliere', datiMissioni);
    aggiornaBadgeMissioni();
}

// Ricompensa per missione completata
function ricompensaMissione(missione) {
    const saldoCorrente = getCaramelle();
    setCaramelle(saldoCorrente + missione.ricompensa);
    
    playSound('win');
    showNotification(
        `🎉 Missione Completata: ${missione.nome}! +${missione.ricompensa}💵`,
        'success',
        5000
    );

    // Mostra popup missione completata
    mostraPopupMissione(missione);
}

// Mostra popup missione completata
function mostraPopupMissione(missione) {
    const popup = document.getElementById('missionCompletedPopup');
    if (!popup) return;

    document.getElementById('missionCompletedIcon').textContent = missione.icona;
    document.getElementById('missionCompletedName').textContent = missione.nome;
    document.getElementById('missionCompletedReward').textContent = missione.ricompensa;

    popup.style.display = 'flex';

    setTimeout(() => {
        popup.classList.add('show');
    }, 10);

    setTimeout(() => {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.style.display = 'none';
        }, 300);
    }, 4000);
}

// Renderizza UI missioni
export function renderMissioni() {
    const missioni = getMissioniGiornaliere();
    const progresso = getProgressoMissioni();
    const lista = document.getElementById('missionsList');

    if (!lista) return;

    // Riconverti temiUsati in Set per i check
    if (Array.isArray(progresso.temiUsati)) {
        progresso.temiUsati = new Set(progresso.temiUsati);
    }

    lista.innerHTML = missioni.map(missione => {
        const missioneDefinizione = missioniDisponibili.find(m => m.id === missione.id);
        let progressoTesto = '';
        
        if (missioneDefinizione) {
            switch (missione.id) {
                case 'trova_5_diamanti':
                    progressoTesto = `${progresso.diamantiSingolaPartita || 0}/5`;
                    break;
                case 'vinci_3_5x5':
                    progressoTesto = `${progresso.vittorie5x5 || 0}/3`;
                    break;
                case 'tre_temi':
                    progressoTesto = `${progresso.temiUsati ? progresso.temiUsati.size : 0}/3`;
                    break;
                case 'serie_5':
                    progressoTesto = `${progresso.serieVittorie || 0}/5`;
                    break;
                case 'guadagna_500':
                    progressoTesto = `${progresso.profittoGiornaliero || 0}/500💵`;
                    break;
                default:
                    progressoTesto = missione.completata ? '✓' : '○';
            }
        }

        return `
            <div class="mission-item ${missione.completata ? 'completed' : ''}">
                <div class="mission-icon">${missione.icona}</div>
                <div class="mission-details">
                    <div class="mission-name">${missione.nome}</div>
                    <div class="mission-description">${missione.descrizione}</div>
                    <div class="mission-progress">${progressoTesto}</div>
                </div>
                <div class="mission-reward">
                    ${missione.completata ? 
                        '<span class="mission-completed-badge">✓</span>' : 
                        `<span class="mission-reward-amount">+${missione.ricompensa}💵</span>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

// Aggiorna badge notifica missioni
export function aggiornaBadgeMissioni() {
    const missioni = getMissioniGiornaliere();
    const completate = missioni.filter(m => m.completata).length;
    const button = document.getElementById('missionsButton');
    
    if (button) {
        button.setAttribute('data-count', `${completate}/${missioni.length}`);
    }
}

// Setup modal missioni
export function setupMissionsModal() {
    const button = document.getElementById('missionsButton');
    const modal = document.getElementById('missionsModal');
    const closeBtn = document.getElementById('closeMissions');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderMissioni();
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

// Reset giornaliero (chiamato all'inizializzazione)
export function checkResetMissioni() {
    const oggi = new Date().toDateString();
    const datiMissioni = storage.get('missioniGiornaliere', {});

    if (datiMissioni.data !== oggi) {
        // Nuovo giorno - rigenera missioni
        getMissioniGiornaliere();
        aggiornaBadgeMissioni();
    }
}
