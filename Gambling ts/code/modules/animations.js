// ===== SISTEMA ANIMAZIONI E EFFETTI VISIVI AVANZATI =====

import { storage } from './storage.js';

// Configurazione effetti
let effettiAbilitati = {
    particelle: true,
    esplosioni: true,
    trail: true,
    shake: true,
    glow: true,
    combo: true
};

// Carica preferenze effetti
export function caricaPreferenzeEffetti() {
    effettiAbilitati = storage.get('effettiVisivi', effettiAbilitati);
}

// Salva preferenze effetti
export function salvaPreferenzeEffetti() {
    storage.set('effettiVisivi', effettiAbilitati);
}

// Toggle effetto
export function toggleEffetto(nomeEffetto) {
    if (effettiAbilitati.hasOwnProperty(nomeEffetto)) {
        effettiAbilitati[nomeEffetto] = !effettiAbilitati[nomeEffetto];
        salvaPreferenzeEffetti();
        return effettiAbilitati[nomeEffetto];
    }
    return false;
}

// ===== SISTEMA PARTICELLE =====
export function creaParticelle(elemento, tipo = 'diamante', quantita = 15) {
    if (!effettiAbilitati.particelle) return;

    const rect = elemento.getBoundingClientRect();
    const container = document.getElementById('particles-container') || creaContainerParticelle();

    for (let i = 0; i < quantita; i++) {
        const particella = document.createElement('div');
        particella.className = `particle particle-${tipo}`;
        
        // Posizione iniziale
        particella.style.left = `${rect.left + rect.width / 2}px`;
        particella.style.top = `${rect.top + rect.height / 2}px`;

        // Direzione casuale
        const angolo = (Math.PI * 2 * i) / quantita;
        const velocita = 50 + Math.random() * 100;
        const dx = Math.cos(angolo) * velocita;
        const dy = Math.sin(angolo) * velocita;

        particella.style.setProperty('--dx', `${dx}px`);
        particella.style.setProperty('--dy', `${dy}px`);

        // Icona particella
        switch (tipo) {
            case 'diamante':
                particella.textContent = '💎';
                break;
            case 'bomba':
                particella.textContent = '💥';
                break;
            case 'moneta':
                particella.textContent = '💰';
                break;
            case 'stella':
                particella.textContent = '⭐';
                break;
        }

        container.appendChild(particella);

        // Rimuovi dopo animazione
        setTimeout(() => {
            particella.remove();
        }, 1000);
    }
}

function creaContainerParticelle() {
    const container = document.createElement('div');
    container.id = 'particles-container';
    container.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        z-index: 9999;
    `;
    document.body.appendChild(container);
    return container;
}

// ===== ESPLOSIONE BOMBA AVANZATA =====
export function esplodiBomba(elemento) {
    if (!effettiAbilitati.esplosioni) return;

    // Flash bianco
    const flash = document.createElement('div');
    flash.className = 'explosion-flash';
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: white;
        opacity: 0;
        animation: flashAnimation 0.3s ease-out;
        pointer-events: none;
        z-index: 9998;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 300);

    // Onda d'urto
    creaOndaUrto(elemento);

    // Particelle
    creaParticelle(elemento, 'bomba', 25);

    // Shake schermo
    if (effettiAbilitati.shake) {
        shakeSchermo();
    }
}

function creaOndaUrto(elemento) {
    const rect = elemento.getBoundingClientRect();
    const onda = document.createElement('div');
    onda.className = 'shockwave';
    onda.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        width: 10px;
        height: 10px;
        border: 3px solid #ff4444;
        border-radius: 50%;
        pointer-events: none;
        z-index: 9997;
        animation: shockwaveAnimation 0.6s ease-out;
    `;
    document.body.appendChild(onda);
    
    setTimeout(() => onda.remove(), 600);
}

function shakeSchermo() {
    document.body.classList.add('shake-screen');
    setTimeout(() => {
        document.body.classList.remove('shake-screen');
    }, 500);
}

// ===== EFFETTO COMBO =====
let comboCount = 0;
let comboTimeout = null;

export function mostraCombo(numero) {
    if (!effettiAbilitati.combo) return;

    comboCount = numero;

    // Reset timeout
    if (comboTimeout) clearTimeout(comboTimeout);

    // Mostra indicator
    const comboEl = document.getElementById('combo-indicator') || creaComboIndicator();
    comboEl.textContent = `${comboCount}x COMBO!`;
    comboEl.className = 'combo-indicator show';

    // Aggiungi classi per diverse soglie
    if (comboCount >= 10) {
        comboEl.classList.add('mega');
    } else if (comboCount >= 5) {
        comboEl.classList.add('super');
    }

    // Nascondi dopo 2 secondi
    comboTimeout = setTimeout(() => {
        comboEl.classList.remove('show');
        comboCount = 0;
    }, 2000);
}

function creaComboIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'combo-indicator';
    indicator.className = 'combo-indicator';
    document.body.appendChild(indicator);
    return indicator;
}

// ===== TRAIL CURSORE =====
let trailTimeout = null;
const trailElements = [];

export function iniziaTrailCursore() {
    if (!effettiAbilitati.trail) return;

    document.addEventListener('mousemove', handleMouseMove);
}

export function fermaTrailCursore() {
    document.removeEventListener('mousemove', handleMouseMove);
    trailElements.forEach(el => el.remove());
    trailElements.length = 0;
}

function handleMouseMove(e) {
    if (!effettiAbilitati.trail) return;

    // Limita numero di elementi trail
    if (trailElements.length > 15) {
        const old = trailElements.shift();
        old.remove();
    }

    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.left = `${e.clientX}px`;
    trail.style.top = `${e.clientY}px`;
    
    document.body.appendChild(trail);
    trailElements.push(trail);

    setTimeout(() => {
        trail.remove();
        const index = trailElements.indexOf(trail);
        if (index > -1) trailElements.splice(index, 1);
    }, 500);
}

// ===== EFFETTO GLOW CELLE =====
export function aggiungiGlow(elemento, colore = 'gold') {
    if (!effettiAbilitati.glow) return;

    elemento.style.boxShadow = `0 0 20px ${colore}, 0 0 40px ${colore}`;
    elemento.style.transition = 'box-shadow 0.3s ease';

    setTimeout(() => {
        elemento.style.boxShadow = '';
    }, 1000);
}

// ===== CONFETTI VITTORIA =====
export function celebraVittoria() {
    if (!effettiAbilitati.particelle) return;

    const colori = ['#ffd700', '#ff6b9d', '#00d4ff', '#39ff14', '#ff00ff'];
    const container = document.getElementById('particles-container') || creaContainerParticelle();

    // Crea 100 confetti
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            const confetto = document.createElement('div');
            confetto.className = 'confetti';
            confetto.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${colori[Math.floor(Math.random() * colori.length)]};
                left: ${Math.random() * 100}vw;
                top: -20px;
                animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
                z-index: 9999;
            `;
            
            container.appendChild(confetto);
            
            setTimeout(() => confetto.remove(), 4000);
        }, i * 20);
    }
}

// ===== EFFETTO LEVEL UP =====
export function animazioneLevelUp() {
    const flash = document.createElement('div');
    flash.className = 'levelup-flash';
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle, rgba(255,215,0,0.3) 0%, transparent 70%);
        pointer-events: none;
        z-index: 9998;
        animation: levelupFlash 1s ease-out;
    `;
    document.body.appendChild(flash);
    
    setTimeout(() => flash.remove(), 1000);

    // Raggi di luce
    for (let i = 0; i < 8; i++) {
        const raggio = document.createElement('div');
        raggio.className = 'light-ray';
        raggio.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            width: 200px;
            height: 4px;
            background: linear-gradient(90deg, transparent, gold, transparent);
            transform-origin: left center;
            transform: rotate(${i * 45}deg);
            animation: rayAnimation 1s ease-out;
            pointer-events: none;
            z-index: 9997;
        `;
        document.body.appendChild(raggio);
        
        setTimeout(() => raggio.remove(), 1000);
    }
}

// ===== NUMERO GALLEGGIANTE =====
export function mostraNumeroGalleggiante(elemento, testo, tipo = 'success') {
    const rect = elemento.getBoundingClientRect();
    const numero = document.createElement('div');
    numero.className = `floating-number floating-number-${tipo}`;
    numero.textContent = testo;
    numero.style.cssText = `
        position: fixed;
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top}px;
        transform: translateX(-50%);
        font-size: 24px;
        font-weight: bold;
        color: ${tipo === 'success' ? '#00ff00' : '#ff0000'};
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        pointer-events: none;
        z-index: 9999;
        animation: floatUp 1.5s ease-out forwards;
    `;
    
    document.body.appendChild(numero);
    
    setTimeout(() => numero.remove(), 1500);
}

// ===== PULSAZIONE ELEMENTO =====
export function pulsaElemento(elemento, durata = 500) {
    elemento.classList.add('pulse-animation');
    setTimeout(() => {
        elemento.classList.remove('pulse-animation');
    }, durata);
}

// ===== SETUP ANIMAZIONI =====
export function setupAnimazioni() {
    // Carica preferenze
    caricaPreferenzeEffetti();

    // Inizia trail cursore se abilitato
    if (effettiAbilitati.trail) {
        iniziaTrailCursore();
    }

    // Aggiungi CSS animazioni
    aggiungiCSSAnimazioni();
}

function aggiungiCSSAnimazioni() {
    const style = document.createElement('style');
    style.textContent = `
        .particle {
            position: fixed;
            font-size: 20px;
            animation: particleFloat 1s ease-out forwards;
            pointer-events: none;
            z-index: 9999;
        }

        @keyframes particleFloat {
            from {
                transform: translate(0, 0);
                opacity: 1;
            }
            to {
                transform: translate(var(--dx), var(--dy));
                opacity: 0;
            }
        }

        @keyframes flashAnimation {
            0% { opacity: 0.7; }
            100% { opacity: 0; }
        }

        @keyframes shockwaveAnimation {
            from {
                width: 10px;
                height: 10px;
                opacity: 1;
            }
            to {
                width: 300px;
                height: 300px;
                opacity: 0;
            }
        }

        .shake-screen {
            animation: shake 0.5s ease-in-out;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .combo-indicator {
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%) scale(0);
            font-size: 48px;
            font-weight: bold;
            color: #ffd700;
            text-shadow: 
                0 0 10px #ffd700,
                0 0 20px #ffd700,
                0 0 30px #ffd700;
            z-index: 9999;
            transition: transform 0.3s ease;
            pointer-events: none;
        }

        .combo-indicator.show {
            transform: translateX(-50%) scale(1);
        }

        .combo-indicator.super {
            color: #ff6b9d;
            font-size: 60px;
            text-shadow: 
                0 0 15px #ff6b9d,
                0 0 30px #ff6b9d;
        }

        .combo-indicator.mega {
            color: #ff00ff;
            font-size: 72px;
            text-shadow: 
                0 0 20px #ff00ff,
                0 0 40px #ff00ff;
            animation: rainbow 1s infinite;
        }

        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }

        .cursor-trail {
            position: fixed;
            width: 8px;
            height: 8px;
            background: radial-gradient(circle, #ffd700, transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9998;
            animation: trailFade 0.5s ease-out forwards;
        }

        @keyframes trailFade {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }

        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(720deg);
                opacity: 0;
            }
        }

        @keyframes levelupFlash {
            0%, 100% { opacity: 0; }
            50% { opacity: 1; }
        }

        @keyframes rayAnimation {
            from {
                width: 0;
                opacity: 1;
            }
            to {
                width: 300px;
                opacity: 0;
            }
        }

        @keyframes floatUp {
            from {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
            }
            to {
                transform: translateX(-50%) translateY(-100px);
                opacity: 0;
            }
        }

        .pulse-animation {
            animation: pulse 0.5s ease;
        }

        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
    `;
    document.head.appendChild(style);
}

// Esporta configurazione
export { effettiAbilitati };
