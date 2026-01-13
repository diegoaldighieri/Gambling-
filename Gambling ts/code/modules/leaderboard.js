// ===== SISTEMA LEADERBOARD ONLINE =====

import { storage } from './storage.js';
import { showNotification, playSound } from './audio.js';
import { caricaStatistiche } from './storage.js';

// Configurazione leaderboard (simulata - in produzione usare Firebase/Supabase)
const LEADERBOARD_ENDPOINT = 'https://api.cacciatesoro.example.com/leaderboard';
const USE_LOCAL_STORAGE = true; // true = simula con localStorage, false = usa API reale

// Ottieni nickname giocatore
export function getNickname() {
    return storage.get('playerNickname', 'Giocatore' + Math.floor(Math.random() * 10000));
}

// Imposta nickname
export function setNickname(nickname) {
    if (!nickname || nickname.trim().length === 0) {
        showNotification('❌ Nickname non valido!', 'error');
        return false;
    }

    if (nickname.length > 20) {
        showNotification('❌ Nickname troppo lungo (max 20 caratteri)!', 'error');
        return false;
    }

    storage.set('playerNickname', nickname.trim());
    showNotification('✅ Nickname salvato!', 'success');
    return true;
}

// Ottieni avatar giocatore
export function getAvatar() {
    return storage.get('playerAvatar', '😊');
}

// Imposta avatar
export function setAvatar(emoji) {
    storage.set('playerAvatar', emoji);
    showNotification('✅ Avatar aggiornato!', 'success');
}

// Invia punteggio alla leaderboard
export async function inviaScore(tipo, valore) {
    const stats = caricaStatistiche();
    const nickname = getNickname();
    const avatar = getAvatar();

    const score = {
        nickname,
        avatar,
        tipo, // 'vincita_massima', 'profitto_netto', 'partite_vinte', etc.
        valore,
        timestamp: Date.now(),
        partiteGiocate: stats.partiteGiocate,
        percVittorie: stats.partiteGiocate > 0 ? 
            ((stats.partiteVinte / stats.partiteGiocate) * 100).toFixed(1) : 0
    };

    if (USE_LOCAL_STORAGE) {
        return inviaScoreLocal(score);
    } else {
        return inviaScoreAPI(score);
    }
}

// Salva score localmente (simulazione)
function inviaScoreLocal(score) {
    const leaderboards = storage.get('leaderboards', {
        vincita_massima: [],
        profitto_netto: [],
        partite_vinte: [],
        serie_vittorie: [],
        griglia_3x3: [],
        griglia_4x4: [],
        griglia_5x5: []
    });

    if (!leaderboards[score.tipo]) {
        leaderboards[score.tipo] = [];
    }

    // Aggiungi o aggiorna score
    const existingIndex = leaderboards[score.tipo].findIndex(
        s => s.nickname === score.nickname
    );

    if (existingIndex >= 0) {
        // Aggiorna solo se il nuovo score è migliore
        if (score.valore > leaderboards[score.tipo][existingIndex].valore) {
            leaderboards[score.tipo][existingIndex] = score;
        }
    } else {
        leaderboards[score.tipo].push(score);
    }

    // Ordina e mantieni solo top 100
    leaderboards[score.tipo].sort((a, b) => b.valore - a.valore);
    leaderboards[score.tipo] = leaderboards[score.tipo].slice(0, 100);

    storage.set('leaderboards', leaderboards);
    return Promise.resolve({ success: true });
}

// Invia score via API (da implementare con backend reale)
async function inviaScoreAPI(score) {
    try {
        const response = await fetch(`${LEADERBOARD_ENDPOINT}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(score)
        });

        return await response.json();
    } catch (error) {
        console.error('Errore invio score:', error);
        return { success: false, error };
    }
}

// Carica leaderboard
export async function caricaLeaderboard(tipo = 'vincita_massima', periodo = 'all') {
    if (USE_LOCAL_STORAGE) {
        return caricaLeaderboardLocal(tipo, periodo);
    } else {
        return caricaLeaderboardAPI(tipo, periodo);
    }
}

// Carica leaderboard locale
function caricaLeaderboardLocal(tipo, periodo) {
    const leaderboards = storage.get('leaderboards', {});
    let scores = leaderboards[tipo] || [];

    // Filtra per periodo
    if (periodo === 'week') {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        scores = scores.filter(s => s.timestamp > weekAgo);
    } else if (periodo === 'month') {
        const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        scores = scores.filter(s => s.timestamp > monthAgo);
    }

    return Promise.resolve(scores.slice(0, 50)); // Top 50
}

// Carica leaderboard da API
async function caricaLeaderboardAPI(tipo, periodo) {
    try {
        const response = await fetch(
            `${LEADERBOARD_ENDPOINT}/get?tipo=${tipo}&periodo=${periodo}&limit=50`
        );
        return await response.json();
    } catch (error) {
        console.error('Errore caricamento leaderboard:', error);
        return [];
    }
}

// Ottieni posizione giocatore
export async function getPosizioneGiocatore(tipo = 'vincita_massima') {
    const scores = await caricaLeaderboard(tipo, 'all');
    const nickname = getNickname();
    
    const posizione = scores.findIndex(s => s.nickname === nickname);
    
    if (posizione === -1) {
        return { posizione: null, totale: scores.length };
    }
    
    return { 
        posizione: posizione + 1, 
        totale: scores.length,
        score: scores[posizione]
    };
}

// Renderizza leaderboard
export async function renderLeaderboard(tipo = 'vincita_massima', periodo = 'all') {
    const container = document.getElementById('leaderboardList');
    if (!container) return;

    container.innerHTML = '<div class="loading">Caricamento...</div>';

    const scores = await caricaLeaderboard(tipo, periodo);
    const nickname = getNickname();

    if (scores.length === 0) {
        container.innerHTML = '<div class="leaderboard-empty">Nessun punteggio disponibile</div>';
        return;
    }

    container.innerHTML = scores.map((score, index) => {
        const isMe = score.nickname === nickname;
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        return `
            <div class="leaderboard-item ${isMe ? 'me' : ''}">
                <div class="leaderboard-rank">
                    ${medal || `#${index + 1}`}
                </div>
                <div class="leaderboard-avatar">${score.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-nickname">${score.nickname}</div>
                    <div class="leaderboard-stats">
                        ${score.partiteGiocate} partite · ${score.percVittorie}% vittorie
                    </div>
                </div>
                <div class="leaderboard-score">
                    ${formatScore(score.valore, tipo)}
                </div>
            </div>
        `;
    }).join('');

    // Mostra posizione giocatore se non è in top 50
    const posizioneGiocatore = await getPosizioneGiocatore(tipo);
    if (posizioneGiocatore.posizione && posizioneGiocatore.posizione > 50) {
        container.innerHTML += `
            <div class="leaderboard-divider">...</div>
            <div class="leaderboard-item me">
                <div class="leaderboard-rank">#${posizioneGiocatore.posizione}</div>
                <div class="leaderboard-avatar">${getAvatar()}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-nickname">${getNickname()}</div>
                    <div class="leaderboard-stats">La tua posizione</div>
                </div>
                <div class="leaderboard-score">
                    ${formatScore(posizioneGiocatore.score.valore, tipo)}
                </div>
            </div>
        `;
    }
}

// Formatta score per visualizzazione
function formatScore(valore, tipo) {
    switch (tipo) {
        case 'vincita_massima':
        case 'profitto_netto':
            return `${valore}💵`;
        case 'partite_vinte':
        case 'partite_giocate':
            return `${valore} partite`;
        case 'serie_vittorie':
            return `${valore} 🔥`;
        case 'griglia_3x3':
        case 'griglia_4x4':
        case 'griglia_5x5':
            return `${valore}💵`;
        default:
            return valore;
    }
}

// Setup modal leaderboard
export function setupLeaderboardModal() {
    const button = document.getElementById('leaderboardButton');
    const modal = document.getElementById('leaderboardModal');
    const closeBtn = document.getElementById('closeLeaderboard');
    const tipoTabs = document.querySelectorAll('.leaderboard-tipo-tab');
    const periodoTabs = document.querySelectorAll('.leaderboard-periodo-tab');

    let tipoCorrente = 'vincita_massima';
    let periodoCorrente = 'all';

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        renderLeaderboard(tipoCorrente, periodoCorrente);
    });

    closeBtn?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'none';
    });

    // Tabs tipo
    tipoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            tipoCorrente = tab.dataset.tipo;
            
            tipoTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            renderLeaderboard(tipoCorrente, periodoCorrente);
        });
    });

    // Tabs periodo
    periodoTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            playSound('click');
            periodoCorrente = tab.dataset.periodo;
            
            periodoTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            renderLeaderboard(tipoCorrente, periodoCorrente);
        });
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Setup modal profilo
export function setupProfileModal() {
    const button = document.getElementById('profileButton');
    const modal = document.getElementById('profileModal');
    const closeBtn = document.getElementById('closeProfile');
    const saveBtn = document.getElementById('saveProfile');
    const nicknameInput = document.getElementById('profileNickname');
    const avatarButtons = document.querySelectorAll('.avatar-option');

    button?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'flex';
        
        // Carica dati correnti
        nicknameInput.value = getNickname();
        const currentAvatar = getAvatar();
        avatarButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.avatar === currentAvatar);
        });
    });

    closeBtn?.addEventListener('click', () => {
        playSound('click');
        modal.style.display = 'none';
    });

    // Selezione avatar
    avatarButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            playSound('click');
            avatarButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Salva profilo
    saveBtn?.addEventListener('click', () => {
        playSound('click');
        const nickname = nicknameInput.value;
        const selectedAvatar = document.querySelector('.avatar-option.active');
        
        if (setNickname(nickname)) {
            if (selectedAvatar) {
                setAvatar(selectedAvatar.dataset.avatar);
            }
            modal.style.display = 'none';
        }
    });

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Genera dati fake per testing (opzionale)
export function generaLeaderboardFake() {
    const nomi = [
        'DiamondHunter', 'BombExpert', 'LuckyPlayer', 'ProGamer',
        'TreasureMaster', 'RiskTaker', 'SafePlayer', 'SpeedRunner',
        'StrategyKing', 'FortuneSeeker', 'GemCollector', 'CasinoKing'
    ];
    
    const avatars = ['😊', '😎', '🤑', '🎮', '💎', '🏆', '⚡', '🔥', '🌟', '👑'];

    const leaderboards = {
        vincita_massima: [],
        profitto_netto: [],
        partite_vinte: [],
        serie_vittorie: []
    };

    // Genera 50 entries per ogni tipo
    Object.keys(leaderboards).forEach(tipo => {
        for (let i = 0; i < 50; i++) {
            const nome = nomi[Math.floor(Math.random() * nomi.length)] + Math.floor(Math.random() * 1000);
            const avatar = avatars[Math.floor(Math.random() * avatars.length)];
            
            let valore;
            switch (tipo) {
                case 'vincita_massima':
                    valore = Math.floor(Math.random() * 10000) + 500;
                    break;
                case 'profitto_netto':
                    valore = Math.floor(Math.random() * 20000) - 5000;
                    break;
                case 'partite_vinte':
                    valore = Math.floor(Math.random() * 500) + 10;
                    break;
                case 'serie_vittorie':
                    valore = Math.floor(Math.random() * 30) + 1;
                    break;
            }

            leaderboards[tipo].push({
                nickname: nome,
                avatar,
                tipo,
                valore,
                timestamp: Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000),
                partiteGiocate: Math.floor(Math.random() * 200) + 20,
                percVittorie: (Math.random() * 80 + 10).toFixed(1)
            });
        }

        leaderboards[tipo].sort((a, b) => b.valore - a.valore);
    });

    storage.set('leaderboards', leaderboards);
    showNotification('✅ Leaderboard fake generata!', 'success');
}
