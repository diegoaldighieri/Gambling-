// ===== SISTEMA EVENTI SPECIALI =====

import { storage } from './storage.js';
import { showNotification, playSound } from './audio.js';
import { getCaramelle, setCaramelle } from './balance.js';

// Definizione eventi stagionali
const eventiSpeciali = {
    halloween: {
        id: 'halloween',
        nome: '🎃 Halloween Horror',
        inizio: { mese: 10, giorno: 25 }, // 25 ottobre
        fine: { mese: 11, giorno: 1 },    // 1 novembre
        tema: {
            primary: '#ff6600',
            primaryHover: '#ff4400',
            secondary: '#9933ff',
            background: '#1a0a0a',
            cardBg: '#2d1515',
            cellBg: '#4a2020',
            text: '#ffcc99',
            textDark: '#1a0a0a'
        },
        bombaIcon: '🎃',
        diamanteIcon: '👻',
        moltiplicatoreBonus: 0.2, // +20%
        ricompenseExtra: true
    },
    natale: {
        id: 'natale',
        nome: '🎄 Natale Magico',
        inizio: { mese: 12, giorno: 20 },
        fine: { mese: 12, giorno: 26 },
        tema: {
            primary: '#cc0000',
            primaryHover: '#aa0000',
            secondary: '#00cc44',
            background: '#001a0a',
            cardBg: '#1a2d1a',
            cellBg: '#2d4a2d',
            text: '#ffeeee',
            textDark: '#001a0a'
        },
        bombaIcon: '❄️',
        diamanteIcon: '🎁',
        moltiplicatoreBonus: 0.3, // +30%
        ricompenseExtra: true,
        neveAttiva: true
    },
    sanValentino: {
        id: 'sanValentino',
        nome: '💘 San Valentino',
        inizio: { mese: 2, giorno: 12 },
        fine: { mese: 2, giorno: 15 },
        tema: {
            primary: '#ff1493',
            primaryHover: '#ff0080',
            secondary: '#ff69b4',
            background: '#1a0010',
            cardBg: '#2d1020',
            cellBg: '#4a1a30',
            text: '#ffccee',
            textDark: '#1a0010'
        },
        bombaIcon: '💔',
        diamanteIcon: '💖',
        moltiplicatoreBonus: 0.25,
        ricompenseExtra: true
    },
    capodanno: {
        id: 'capodanno',
        nome: '🎆 Capodanno',
        inizio: { mese: 12, giorno: 31 },
        fine: { mese: 1, giorno: 2 },
        tema: {
            primary: '#ffd700',
            primaryHover: '#ffed4e',
            secondary: '#ff6600',
            background: '#000000',
            cardBg: '#1a1a0a',
            cellBg: '#2d2d15',
            text: '#ffffff',
            textDark: '#000000'
        },
        bombaIcon: '💥',
        diamanteIcon: '🎆',
        moltiplicatoreBonus: 0.5, // +50%!
        ricompenseExtra: true,
        fuochiArtificio: true
    },
    pasqua: {
        id: 'pasqua',
        nome: '🐰 Caccia alle Uova',
        inizio: { mese: 4, giorno: 15 }, // Variabile - da aggiustare ogni anno
        fine: { mese: 4, giorno: 18 },
        tema: {
            primary: '#ffb347',
            primaryHover: '#ffa500',
            secondary: '#87ceeb',
            background: '#f0f8ff',
            cardBg: '#e6f2ff',
            cellBg: '#cce6ff',
            text: '#333333',
            textDark: '#ffffff'
        },
        bombaIcon: '🥚',
        diamanteIcon: '🐣',
        moltiplicatoreBonus: 0.2,
        ricompenseExtra: true
    },
    stPatrick: {
        id: 'stPatrick',
        nome: '🍀 St. Patrick\'s Day',
        inizio: { mese: 3, giorno: 16 },
        fine: { mese: 3, giorno: 18 },
        tema: {
            primary: '#00cc44',
            primaryHover: '#00aa33',
            secondary: '#ffd700',
            background: '#001a0a',
            cardBg: '#0a2d0a',
            cellBg: '#154a15',
            text: '#ccffcc',
            textDark: '#001a0a'
        },
        bombaIcon: '☘️',
        diamanteIcon: '🍀',
        moltiplicatoreBonus: 0.3,
        ricompenseExtra: true,
        fortunaX2: true // Probabilità vincita raddoppiata
    }
};

// Ottieni evento attivo corrente
export function getEventoAttivo() {
    const oggi = new Date();
    const mese = oggi.getMonth() + 1; // JavaScript usa 0-11
    const giorno = oggi.getDate();

    for (const [key, evento] of Object.entries(eventiSpeciali)) {
        const { inizio, fine } = evento;
        
        // Gestione evento a cavallo dell'anno (es. Capodanno)
        if (inizio.mese > fine.mese) {
            // Evento attraversa l'anno nuovo
            if ((mese === inizio.mese && giorno >= inizio.giorno) ||
                (mese === fine.mese && giorno <= fine.giorno) ||
                (mese > inizio.mese || mese < fine.mese)) {
                return evento;
            }
        } else {
            // Evento normale nello stesso anno
            if ((mese === inizio.mese && giorno >= inizio.giorno && 
                 (mese < fine.mese || (mese === fine.mese && giorno <= fine.giorno))) ||
                (mese > inizio.mese && mese < fine.mese) ||
                (mese === fine.mese && giorno <= fine.giorno)) {
                return evento;
            }
        }
    }

    return null;
}

// Controlla e attiva evento
export function checkEventoSpeciale() {
    const evento = getEventoAttivo();
    const ultimoEventoVisto = storage.get('ultimoEventoVisto', '');

    if (evento && evento.id !== ultimoEventoVisto) {
        mostraNotificaEvento(evento);
        storage.set('ultimoEventoVisto', evento.id);
        applicaTemaEvento(evento);
        return evento;
    }

    if (!evento && ultimoEventoVisto) {
        // Evento terminato
        storage.set('ultimoEventoVisto', '');
    }

    return evento;
}

// Mostra notifica evento
function mostraNotificaEvento(evento) {
    const popup = document.createElement('div');
    popup.className = 'evento-popup';
    popup.innerHTML = `
        <div class="evento-content">
            <h2>${evento.nome}</h2>
            <p>🎉 Evento Speciale Attivo!</p>
            <p>Bonus Moltiplicatore: +${(evento.moltiplicatoreBonus * 100).toFixed(0)}%</p>
            ${evento.ricompenseExtra ? '<p>✨ Ricompense Extra Disponibili!</p>' : ''}
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    
    document.body.appendChild(popup);
    playSound('levelup');

    // Auto-rimuovi dopo 10 secondi
    setTimeout(() => {
        if (popup.parentElement) popup.remove();
    }, 10000);
}

// Applica tema evento
function applicaTemaEvento(evento) {
    if (!evento || !evento.tema) return;

    const { tema } = evento;
    
    document.documentElement.style.setProperty('--color-primary', tema.primary);
    document.documentElement.style.setProperty('--color-primary-hover', tema.primaryHover);
    document.documentElement.style.setProperty('--color-secondary', tema.secondary);
    document.documentElement.style.setProperty('--color-background', tema.background);
    document.documentElement.style.setProperty('--color-card-bg', tema.cardBg);
    document.documentElement.style.setProperty('--color-cell-bg', tema.cellBg);
    document.documentElement.style.setProperty('--color-text', tema.text);
    document.documentElement.style.setProperty('--color-text-dark', tema.textDark);
}

// Ottieni icone evento
export function getIconeEvento() {
    const evento = getEventoAttivo();
    if (!evento) return { bomba: '💣', diamante: '💎' };
    
    return {
        bomba: evento.bombaIcon || '💣',
        diamante: evento.diamanteIcon || '💎'
    };
}

// Ottieni bonus moltiplicatore evento
export function getBonusMoltiplicatoreEvento() {
    const evento = getEventoAttivo();
    return evento ? evento.moltiplicatoreBonus : 0;
}

// ===== EFFETTI SPECIALI EVENTI =====

// Neve animata (Natale)
export function iniziaNeveNatale() {
    const evento = getEventoAttivo();
    if (!evento || !evento.neveAttiva) return;

    const container = document.getElementById('neve-container') || creaNeveContainer();
    
    // Crea fiocchi di neve
    setInterval(() => {
        const fiocco = document.createElement('div');
        fiocco.className = 'fiocco-neve';
        fiocco.textContent = '❄️';
        fiocco.style.left = Math.random() * 100 + 'vw';
        fiocco.style.animationDuration = (5 + Math.random() * 5) + 's';
        fiocco.style.opacity = 0.5 + Math.random() * 0.5;
        
        container.appendChild(fiocco);
        
        setTimeout(() => fiocco.remove(), 10000);
    }, 500);
}

function creaNeveContainer() {
    const container = document.createElement('div');
    container.id = 'neve-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(container);
    return container;
}

// Fuochi d'artificio (Capodanno)
export function lanciaMoltoFuochiArtificio() {
    const evento = getEventoAttivo();
    if (!evento || !evento.fuochiArtificio) return;

    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            lanciaFuocoArtificio();
        }, i * 300);
    }
}

function lanciaFuocoArtificio() {
    const colori = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffd700'];
    const x = 20 + Math.random() * 60; // 20-80% larghezza
    const y = 20 + Math.random() * 40; // 20-60% altezza
    
    // Crea esplosione
    for (let i = 0; i < 30; i++) {
        const particella = document.createElement('div');
        particella.style.cssText = `
            position: fixed;
            left: ${x}vw;
            top: ${y}vh;
            width: 4px;
            height: 4px;
            background: ${colori[Math.floor(Math.random() * colori.length)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        const angolo = (Math.PI * 2 * i) / 30;
        const velocita = 100 + Math.random() * 100;
        const dx = Math.cos(angolo) * velocita;
        const dy = Math.sin(angolo) * velocita;
        
        particella.style.animation = `fuocoArtificioAnimation 1.5s ease-out forwards`;
        particella.style.setProperty('--dx', dx + 'px');
        particella.style.setProperty('--dy', dy + 'px');
        
        document.body.appendChild(particella);
        
        setTimeout(() => particella.remove(), 1500);
    }
}

// ===== MISSIONI EVENTO =====

export function getMissioniEvento() {
    const evento = getEventoAttivo();
    if (!evento) return [];

    const missioniBase = {
        halloween: [
            {
                id: 'halloween_1',
                nome: 'Cacciatore di Fantasmi',
                descrizione: `Trova 30 ${evento.diamanteIcon} oggi`,
                obiettivo: 30,
                ricompensa: 500,
                progresso: 0
            },
            {
                id: 'halloween_2',
                nome: 'Notte di Halloween',
                descrizione: 'Vinci 10 partite durante l\'evento',
                obiettivo: 10,
                ricompensa: 750,
                progresso: 0
            }
        ],
        natale: [
            {
                id: 'natale_1',
                nome: 'Collezionista di Regali',
                descrizione: `Trova 50 ${evento.diamanteIcon}`,
                obiettivo: 50,
                ricompensa: 1000,
                progresso: 0
            },
            {
                id: 'natale_2',
                nome: 'Spirito Natalizio',
                descrizione: 'Vinci 15 partite durante l\'evento',
                obiettivo: 15,
                ricompensa: 1500,
                progresso: 0
            }
        ],
        capodanno: [
            {
                id: 'capodanno_1',
                nome: 'Botto di Capodanno',
                descrizione: 'Vinci 2000💵 in una partita',
                obiettivo: 2000,
                ricompensa: 2000,
                progresso: 0
            }
        ]
    };

    const missioni = missioniBase[evento.id] || [];
    const progressoSalvato = storage.get(`evento_${evento.id}_progresso`, {});

    return missioni.map(m => ({
        ...m,
        progresso: progressoSalvato[m.id] || 0
    }));
}

// Aggiorna progresso missione evento
export function aggiornaProgressoEvento(tipo, valore) {
    const evento = getEventoAttivo();
    if (!evento) return;

    const progressoKey = `evento_${evento.id}_progresso`;
    const progresso = storage.get(progressoKey, {});

    getMissioniEvento().forEach(missione => {
        if (missione.id.includes(tipo)) {
            progresso[missione.id] = (progresso[missione.id] || 0) + valore;
            
            if (progresso[missione.id] >= missione.obiettivo) {
                completaMissioneEvento(missione);
            }
        }
    });

    storage.set(progressoKey, progresso);
}

// Completa missione evento
function completaMissioneEvento(missione) {
    const completateKey = `evento_${getEventoAttivo().id}_completate`;
    const completate = storage.get(completateKey, []);

    if (!completate.includes(missione.id)) {
        completate.push(missione.id);
        storage.set(completateKey, completate);

        // Ricompensa
        setCaramelle(getCaramelle() + missione.ricompensa);
        
        showNotification(
            `🎉 Missione Evento Completata: ${missione.nome}! +${missione.ricompensa}💵`,
            'success',
            5000
        );
        playSound('win');
    }
}

// Renderizza pannello evento
export function renderPannelloEvento() {
    const evento = getEventoAttivo();
    const container = document.getElementById('eventoPannello');

    if (!container) return;

    if (!evento) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    container.innerHTML = `
        <div class="evento-header">
            <h3>${evento.nome}</h3>
            <div class="evento-bonus">Bonus: +${(evento.moltiplicatoreBonus * 100).toFixed(0)}%</div>
        </div>
        <div class="evento-missioni">
            ${getMissioniEvento().map(m => `
                <div class="evento-missione ${m.progresso >= m.obiettivo ? 'completata' : ''}">
                    <div class="missione-nome">${m.nome}</div>
                    <div class="missione-progresso">
                        ${m.progresso} / ${m.obiettivo}
                    </div>
                    <div class="missione-ricompensa">+${m.ricompensa}💵</div>
                </div>
            `).join('')}
        </div>
    `;
}

// Setup eventi speciali
export function setupEventiSpeciali() {
    const evento = checkEventoSpeciale();
    
    if (evento) {
        if (evento.neveAttiva) {
            iniziaNeveNatale();
        }
        
        renderPannelloEvento();
    }
}

// Aggiungi CSS per eventi
export function aggiungiCSSEventi() {
    const style = document.createElement('style');
    style.textContent = `
        .evento-popup {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        }

        .evento-content {
            background: var(--color-card-bg);
            padding: 40px;
            border-radius: 20px;
            text-align: center;
            max-width: 500px;
            border: 3px solid var(--color-primary);
            animation: slideIn 0.5s ease;
        }

        .evento-content h2 {
            font-size: 32px;
            margin-bottom: 20px;
            color: var(--color-primary);
        }

        .evento-content button {
            margin-top: 20px;
            padding: 12px 30px;
            font-size: 18px;
            background: var(--color-primary);
            color: var(--color-text-dark);
            border: none;
            border-radius: 10px;
            cursor: pointer;
        }

        .fiocco-neve {
            position: absolute;
            font-size: 20px;
            animation: neveCaduta 10s linear forwards;
        }

        @keyframes neveCaduta {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }

        @keyframes fuocoArtificioAnimation {
            from {
                transform: translate(0, 0);
                opacity: 1;
            }
            to {
                transform: translate(var(--dx), var(--dy));
                opacity: 0;
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideIn {
            from {
                transform: translateY(-50px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Esporta eventi
export { eventiSpeciali };
