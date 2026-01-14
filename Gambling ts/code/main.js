// ===== CACCIA AL TESORO v4.0 - FILE PRINCIPALE COMPLETO =====

// ===== IMPORT MODULI BASE =====
import { playSound, showNotification } from './modules/audio.js';
import { getCaramelle, setCaramelle, inizializzaSaldo } from './modules/balance.js';
import { checkDailyBonus, closeDailyBonus } from './modules/dailyBonus.js';
import { getPlayerLevel, updateLevelDisplay, checkLevelUp } from './modules/levels.js';
import { updateAchievementsButton, renderAchievements, checkAchievements } from './modules/achievements.js';
import { aggiornaStatistiche, aggiornaUIStatistiche } from './modules/statistics.js';
import { updateStreak } from './modules/streak.js';
import { applyTheme, setupThemeListeners, getThemeImage, getCurrentTheme } from './modules/themes.js';
import { getMoltiplicatorePerDiamanti, aggiornaMoltiplicatore } from './modules/multipliers.js';
import {
    validateBet,
    getTotaleCelle,
    aggiornaRischio,
    debounce,
    shareResult
} from './modules/utils.js';
import {
    salvaUltimaScommessa,
    caricaUltimaScommessa,
    salvaUltimaBombeCount,
    caricaUltimaBombeCount,
    salvaUltimaVersione,
    caricaUltimaVersione,
    caricaTema,
    salvaStatoGioco as salvaStato,
    caricaStatoGioco,
    resetStatoGioco,
    isTutorialCompleted,
    getLastLogin
} from './modules/storage.js';
import { levels } from './modules/config.js';

// ===== IMPORT NUOVI MODULI =====

// Missioni giornaliere
import {
    getMissioniGiornaliere,
    aggiornaProgressoMissione,
    checkResetMissioni,
    setupMissionsModal,
    aggiornaBadgeMissioni,
    renderMissioni
} from './modules/missions.js';

// Shop e Power-ups
import {
    setupShopModal,
    setupInventoryModal,
    usaPowerup,
    hasPowerupAttivo,
    getBonusMoltiplicatoreAttivo,
    consumaPowerupTemporaneo,
    disattivaPowerup,
    renderShop,
    renderInventario,
    acquistaItem
} from './modules/shop.js';

// Leaderboard e Profilo
import {
    setupLeaderboardModal,
    setupProfileModal,
    inviaScore,
    getNickname,
    getAvatar
    // generaLeaderboardFake // Decommenta per testing
} from './modules/leaderboard.js';

// Modalità di gioco alternative
import {
    setModalita,
    getModalitaCorrente,
    setupModalitaModal,
    iniziaTimeAttack,
    stopTimeAttack,
    diamanteTrovatoTimeAttack,
    vittoriaSurvival,
    sconfittaSurvival,
    iniziaSurvival,
    iniziaEndless,
    diamanteTrovatoEndless,
    terminaEndless,
    checkSbloccoModalita,
    getBonusModalita
} from './modules/gamemodes.js';

// Animazioni e effetti
import {
    setupAnimazioni,
    creaParticelle,
    esplodiBomba,
    mostraCombo,
    celebraVittoria,
    animazioneLevelUp,
    mostraNumeroGalleggiante,
    pulsaElemento
} from './modules/animations.js';

// Eventi speciali
import {
    checkEventoSpeciale,
    setupEventiSpeciali,
    getEventoAttivo,
    getIconeEvento,
    getBonusMoltiplicatoreEvento,
    aggiornaProgressoEvento,
    renderPannelloEvento

} from './modules/events.js';

// PWA
import {
    inizializzaPWA,
    richiediPermessiNotifiche,
    trackEvent,
    trackScreen
} from './modules/pwa.js';

// Sfide e Multiplayer
import {
    setupSfideModal,
    creaSfida,
    aggiornaPunteggioSfida,
    terminaSfida,
    getSfidaGiornaliera,
    controllaSfidaGiornaliera
} from './modules/challenges.js';

// ===== DOM ELEMENTI =====
const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
const accontentati = document.getElementById("accontentati");
const numBombeInput = document.getElementById("numBombe");
const decreaseBombs = document.getElementById("decreaseBombs");
const increaseBombs = document.getElementById("increaseBombs");
const scommessa = document.getElementById("scommessa");
const versioni = [v1, v2, v3];

// ===== VARIABILI STATO GIOCO =====
let versione = 0;
let celle = [];
let bombe = [];
let cliccata = [];
let trovati = 0;
let inGioco = false;
let numBombe = 1;
let totalescommessa = 0;
let cmoltiplicatore = 1;

// ===== ESPORTA FUNZIONI GLOBALI =====
window.updateLevelDisplay = updateLevelDisplay;
window.closePopup = closePopup;
window.closeDailyBonus = closeDailyBonus;
window.shareResult = () => shareResult(totalescommessa * cmoltiplicatore, versione, numBombe);

// Funzioni shop per HTML
window.shopBuy = (id, categoria) => {
    acquistaItem(id, categoria);
};

window.usePowerup = (id) => {
    usaPowerup(id, { celle, cliccata, bombe, trovati });
};

window.selectModalita = (nome) => {
    setModalita(nome);
    const modal = document.getElementById('modalitaModal');
    if (modal) modal.style.display = 'none';
};

window.creaSfidaVsCPU = (tipo) => {
    creaSfida(tipo, 'CPU');
    const modal = document.getElementById('sfideModal');
    if (modal) modal.style.display = 'none';
};

// ===== FUNZIONI PRINCIPALI GIOCO =====

function getTotaleCelleCorrente() {
    return getTotaleCelle(versione);
}

function aggiornaMoltiplicatoreCorrente() {
    aggiornaMoltiplicatore(
        cmoltiplicatore,
        totalescommessa,
        trovati,
        getTotaleCelleCorrente(),
        numBombe,
        inGioco
    );
}

function aggiornaMaxBombe() {
    const totaleCelle = getTotaleCelleCorrente();
    if (totaleCelle === 0) {
        numBombeInput.max = 1;
        numBombe = 1;
        numBombeInput.value = 1;
        return;
    }

    const maxBombe = Math.floor(totaleCelle * 0.8);
    numBombeInput.max = maxBombe;

    if (numBombe > maxBombe) {
        numBombe = maxBombe;
        numBombeInput.value = maxBombe;
    }

    aggiornaRischio(numBombe, totaleCelle);
    aggiornaMoltiplicatoreCorrente();
}

function setTotaleScommessa(n) {
    if (inGioco) {
        scommessa.value = totalescommessa;
        return;
    }

    if (n < 0) n = 0;
    if (n > getCaramelle()) n = getCaramelle();

    totalescommessa = n;
    scommessa.value = n;
    salvaUltimaScommessa(n);
    aggiornaMoltiplicatoreCorrente();
}

function aggiungiScommessa(amount) {
    if (inGioco) return;
    playSound('click');
    setTotaleScommessa(totalescommessa + amount);
}

function salvaStatoGioco() {
    const stato = {
        inGioco,
        versione,
        numBombe,
        totalescommessa,
        cmoltiplicatore,
        trovati,
        bombe,
        cliccata
    };
    salvaStato(stato);
}

function generacelle() {
    if (!validateBet(totalescommessa, getCaramelle())) {
        return;
    }

    if (versione === 0) {
        showNotification('⚠️ Seleziona una dimensione della griglia!', 'warning');
        return;
    }

    playSound('click');

    // Reset gioco
    celle.forEach(c => c.remove());
    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;
    cmoltiplicatore = 1;
    aggiornaMoltiplicatoreCorrente();

    const grid = document.getElementById("grid");
    const totaleCelle = getTotaleCelleCorrente();

    if (totaleCelle === 0) return;

    inGioco = true;

    // Imposta layout griglia
    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

    // Ottieni icone evento (se attivo)
    const icone = getIconeEvento();

    // Crea celle
    for (let i = 0; i < totaleCelle; i++) {
        const cella = document.createElement("button");
        const img = document.createElement("img");

        img.src = getThemeImage(getCurrentTheme());
        img.classList.add("cella-img");

        cella.appendChild(img);
        cella.id = "cella_" + i;

        grid.appendChild(cella);

        celle.push(cella);
        cliccata.push(false);
    }

    // Genera bombe
    bombe = [];
    while (bombe.length < numBombe) {
        const indiceBomba = Math.floor(Math.random() * totaleCelle);
        if (!bombe.includes(indiceBomba)) {
            bombe.push(indiceBomba);
        }
    }

    // Aggiungi event listeners
    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => handleCellaClick(index, cella, totaleCelle));
    });

    // Inizializza modalità speciali
    const modalita = getModalitaCorrente();
    if (modalita === 'timeAttack') {
        iniziaTimeAttack();
    } else if (modalita === 'survival') {
        iniziaSurvival();
    } else if (modalita === 'endless') {
        iniziaEndless();
    }

    // Tracking
    trackEvent('Game', 'Start', `Grid${versione}x${versione}`, totalescommessa);
}

function handleCellaClick(index, cella, totaleCelle) {
    if (cliccata[index] || !inGioco) return;
    cliccata[index] = true;

    cella.classList.add('revealing');

    setTimeout(() => {
        cella.innerHTML = "";

        if (bombe.includes(index)) {
            handleBombClick(cella);
        } else {
            handleDiamondClick(cella, totaleCelle);
        }
    }, 300);

    salvaStatoGioco();
}

function handleBombClick(cella) {
    inGioco = false;

    // ===== EFFETTI VISIVI =====
    esplodiBomba(cella);

    playSound('bomb');

    // Ottieni icona bomba evento
    const icone = getIconeEvento();
    cella.classList.remove('revealing');
    cella.classList.add('bomb-reveal');
    cella.innerHTML = icone.bomba;

    const gridWrapper = document.querySelector('.grid-wrapper');
    if (gridWrapper) {
        gridWrapper.classList.add('shake');
        setTimeout(() => gridWrapper.classList.remove('shake'), 500);
    }

    // ===== GESTIONE MODALITÀ SPECIALI =====
    const modalita = getModalitaCorrente();

    // Survival: perde vita ma continua
    if (modalita === 'survival') {
        sconfittaSurvival();
        // Se ha ancora vite, non mostra tutto
        return;
    }

    // Time Attack: ferma timer
    if (modalita === 'timeAttack') {
        stopTimeAttack();
    }

    // Protezione bomba power-up
    if (hasPowerupAttivo('bomb_protection')) {
        disattivaPowerup('bomb_protection');
        showNotification('🛡️ Protezione usata! Sei salvo!', 'success');
        inGioco = true;
        return;
    }

    setTimeout(() => {
        celle.forEach((c, i) => {
            if (!cliccata[i]) {
                c.innerHTML = "";
                if (bombe.includes(i)) {
                    c.classList.add('bomb-reveal-secondary');
                    c.innerHTML = icone.bomba;
                } else {
                    c.classList.add('diamond-reveal-missed');
                    c.innerHTML = icone.diamante;
                }
            }
        });
    }, 300);

    setTimeout(() => {
        setCaramelle(getCaramelle() - totalescommessa);
        document.getElementById("statCelleTrovate").textContent = trovati;
        aggiornaStatistiche('persa', 0, totalescommessa);
        updateStreak(false);

        // Consuma power-up temporanei
        consumaPowerupTemporaneo('multiplier_boost');
        consumaPowerupTemporaneo('xp_boost');

        resetStatoGioco();

        // Tracking
        trackEvent('Game', 'Lose', `Grid${versione}x${versione}`, totalescommessa);

        document.getElementById("overlay").style.display = "flex";
    }, 1000);
}

function handleDiamondClick(cella, totaleCelle) {
    playSound('diamond');

    // Ottieni icona diamante evento
    const icone = getIconeEvento();

    cella.classList.remove('revealing');
    cella.classList.add('diamond-reveal');

    if (trovati >= 2) {
        cella.classList.add('combo-hit');
    }

    cella.innerHTML = icone.diamante;
    trovati++;

    // ===== EFFETTI VISIVI =====
    creaParticelle(cella, 'diamante', 15);
    mostraNumeroGalleggiante(cella, '+1 💎', 'success');
    pulsaElemento(cella);

    // Sistema combo
    if (trovati >= 3) {
        mostraCombo(trovati);
    }

    cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati, totaleCelle, numBombe);
    aggiornaMoltiplicatoreCorrente();

    // ===== TRACKING MISSIONI =====
    aggiornaProgressoMissione('diamantiSingolaPartita', trovati);

    // Eventi
    const evento = getEventoAttivo();
    if (evento) {
        aggiornaProgressoEvento('diamanti', 1);
    }

    // ===== MODALITÀ SPECIALI =====
    const modalita = getModalitaCorrente();
    if (modalita === 'timeAttack') {
        diamanteTrovatoTimeAttack();
    } else if (modalita === 'endless') {
        diamanteTrovatoEndless();
    }

    // Sfide
    aggiornaPunteggioSfida(1);

    const gameState = { trovati, inGioco, versione, numBombe };
    checkAchievements(gameState);

    const celleSicureTotali = totaleCelle - numBombe;
    if (trovati === celleSicureTotali) {
        handleVictory();
    }
}

function handleVictory() {
    inGioco = false;

    // Calcola moltiplicatore finale con tutti i bonus
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const shopBonus = getBonusMoltiplicatoreAttivo();
    const eventoBonus = getBonusMoltiplicatoreEvento();
    const gamemodeBonus = getBonusModalita();

    const finalMultiplier = cmoltiplicatore * levelMultiplier * (1 + shopBonus) * (1 + eventoBonus) * (1 + gamemodeBonus);
    const premio = Math.floor(totalescommessa * finalMultiplier);

    // Ottieni icone evento
    const icone = getIconeEvento();

    setTimeout(() => {
        celle.forEach((c, i) => {
            if (!cliccata[i]) {
                c.innerHTML = "";
                if (bombe.includes(i)) {
                    c.classList.add('bomb-reveal-win');
                    c.innerHTML = icone.bomba;
                }
            }
        });
    }, 300);

    setTimeout(() => {
        // ===== EFFETTI VITTORIA =====
        celebraVittoria();

        playSound('win');
        setCaramelle(getCaramelle() + premio);
        document.getElementById("statVincita").textContent = premio;

        aggiornaStatistiche('vinta', premio, totalescommessa);
        updateStreak(true);

        // ===== TRACKING MISSIONI =====
        if (versione === 3) {
            aggiornaProgressoMissione('vittorie5x5', 1);
        }
        aggiornaProgressoMissione('vittoriaSenzaCashout', true);

        // Eventi
        const evento = getEventoAttivo();
        if (evento) {
            aggiornaProgressoEvento('vittorie', 1);
        }

        // ===== LEADERBOARD =====
        inviaScore('vincita_massima', premio);
        inviaScore('profitto_netto', premio - totalescommessa);

        // ===== MODALITÀ SPECIALI =====
        const modalita = getModalitaCorrente();
        if (modalita === 'survival') {
            vittoriaSurvival();
        } else if (modalita === 'endless') {
            terminaEndless(premio);
        }

        // Sfide
        aggiornaPunteggioSfida(premio);
        controllaSfidaGiornaliera('vincita_massima', premio);

        const gameState = { trovati, inGioco: false, versione, numBombe };
        checkAchievements(gameState);

        // Sblocco modalità
        checkSbloccoModalita({partiteGiocate: 1, partiteVinte: 1});

        // Check level up
        checkLevelUp();

        // Consuma power-up temporanei
        consumaPowerupTemporaneo('multiplier_boost');
        consumaPowerupTemporaneo('xp_boost');
        if (hasPowerupAttivo('double_win')) {
            disattivaPowerup('double_win');
        }

        resetStatoGioco();

        // Tracking
        trackEvent('Game', 'Win', `Grid${versione}x${versione}`, premio);

        document.getElementById("overlay2").style.display = "flex";
    }, 1200);
}

function handleCashout() {
    if (!inGioco) return;

    if (trovati === 0) {
        showNotification('❌ Devi scoprire almeno una cella prima di ritirare!', 'error');
        return;
    }

    playSound('cashout');

    // Calcola moltiplicatore finale
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const shopBonus = getBonusMoltiplicatoreAttivo();
    const eventoBonus = getBonusMoltiplicatoreEvento();
    const gamemodeBonus = getBonusModalita();

    const finalMultiplier = cmoltiplicatore * levelMultiplier * (1 + shopBonus) * (1 + eventoBonus) * (1 + gamemodeBonus);
    const premio = Math.floor(totalescommessa * finalMultiplier);

    setCaramelle(getCaramelle() + premio - totalescommessa);

    document.getElementById("statCashout").textContent = premio;

    // Ottieni icone evento
    const icone = getIconeEvento();

    celle.forEach((c, i) => {
        if (!cliccata[i]) {
            c.innerHTML = "";
            if (bombe.includes(i)) {
                c.classList.add('bomb-reveal-cashout');
                c.innerHTML = icone.bomba;
            } else {
                c.classList.add('diamond-reveal-missed');
                c.innerHTML = icone.diamante;
            }
        }
    });

    aggiornaStatistiche('cashout', premio, totalescommessa);
    updateStreak(true);

    // Missioni
    const cashoutMult = premio / totalescommessa;
    if (Math.abs(cashoutMult - 2.50) < 0.05) {
        aggiornaProgressoMissione('cashout250x', true);
    }
    if (trovati === 1) {
        aggiornaProgressoMissione('cashout_veloce', true);
    }

    // Leaderboard
    inviaScore('vincita_massima', premio);

    // Sfide
    controllaSfidaGiornaliera('vincita_massima', premio);

    const gameState = { trovati, inGioco: false, versione, numBombe };
    checkAchievements(gameState);

    // Consuma power-up
    consumaPowerupTemporaneo('multiplier_boost');
    consumaPowerupTemporaneo('xp_boost');

    resetStatoGioco();
    inGioco = false;

    // Tracking
    trackEvent('Game', 'Cashout', `Grid${versione}x${versione}`, premio);

    setTimeout(() => {
        document.getElementById("overlay3").style.display = "flex";
    }, 500);
}

function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("overlay2").style.display = "none";
    document.getElementById("overlay3").style.display = "none";

    celle.forEach(c => c.remove());

    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;
    cmoltiplicatore = 1;
    inGioco = false;

    if (totalescommessa > getCaramelle()) {
        totalescommessa = 0;
        scommessa.value = 0;
    }

    aggiornaMoltiplicatoreCorrente();
}

// ===== EVENT LISTENERS =====

// Versioni griglia
versioni.forEach((btn, index) => {
    btn.addEventListener("click", () => {
        if (inGioco) return;
        playSound('click');
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        versione = index + 1;
        salvaUltimaVersione(versione);
        aggiornaMaxBombe();
    });
});

// Bombe
decreaseBombs.addEventListener("click", () => {
    if (inGioco) return;
    playSound('click');

    const min = parseInt(numBombeInput.min);
    if (numBombe > min) {
        numBombe--;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio(numBombe, getTotaleCelleCorrente());
        aggiornaMoltiplicatoreCorrente();
    }
});

increaseBombs.addEventListener("click", () => {
    if (inGioco) return;
    playSound('click');

    const max = parseInt(numBombeInput.max);
    if (numBombe < max) {
        numBombe++;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio(numBombe, getTotaleCelleCorrente());
        aggiornaMoltiplicatoreCorrente();
    }
});

numBombeInput.addEventListener("change", () => {
    if (inGioco) return;

    let val = parseInt(numBombeInput.value) || 1;
    const min = parseInt(numBombeInput.min);
    const max = parseInt(numBombeInput.max);

    if (val < min) val = min;
    if (val > max) val = max;

    numBombe = val;
    numBombeInput.value = val;
    salvaUltimaBombeCount(numBombe);
    aggiornaRischio(numBombe, getTotaleCelleCorrente());
    aggiornaMoltiplicatoreCorrente();
});

// Scommessa
scommessa.addEventListener("input", debounce(() => {
    if (inGioco) {
        scommessa.value = totalescommessa;
        return;
    }
    const valore = parseInt(scommessa.value) || 0;
    setTotaleScommessa(valore);
}, 300));

document.getElementById("somma5")?.addEventListener("click", () => aggiungiScommessa(5));
document.getElementById("somma10")?.addEventListener("click", () => aggiungiScommessa(10));
document.getElementById("somma50")?.addEventListener("click", () => aggiungiScommessa(50));
document.getElementById("somma100")?.addEventListener("click", () => aggiungiScommessa(100));
document.getElementById("maxbet")?.addEventListener("click", () => aggiungiScommessa(getCaramelle()));

// Bottoni principali
start.addEventListener("click", generacelle);
accontentati.addEventListener("click", handleCashout);

// Shortcut tastiera
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;

    if (e.key === 'Escape') {
        closePopup();
        document.getElementById('statsModal').style.display = 'none';
        document.getElementById('achievementsModal').style.display = 'none';
        document.getElementById('tutorialModal').style.display = 'none';
        document.getElementById('missionsModal').style.display = 'none';
        document.getElementById('shopModal').style.display = 'none';
        document.getElementById('leaderboardModal').style.display = 'none';
    }

    if (!inGioco) {
        if (e.key === 's' || e.key === 'S') start.click();
        if (e.key === '1') v1.click();
        if (e.key === '2') v2.click();
        if (e.key === '3') v3.click();
    } else {
        if (e.key === 'c' || e.key === 'C') accontentati.click();
    }
});

// Conferma prima di chiudere
window.addEventListener('beforeunload', (e) => {
    if (inGioco) {
        e.preventDefault();
        e.returnValue = '';
    }
});

// Salvataggio automatico
setInterval(() => {
    if (inGioco) salvaStatoGioco();
}, 30000);

// ===== INIZIALIZZAZIONE =====
console.log('🎮 Caccia al Tesoro v4.0 - Inizializzazione...');

// Import dinamici modali base
import('./modules/modals.js').then(modals => {
    modals.setupModals();
});

import('./modules/tutorial.js').then(tutorial => {
    tutorial.setupTutorial();
});

// Inizializza al caricamento pagina
window.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Caricamento dati salvati...');

    // ===== SETUP NUOVI MODALI =====
    setupMissionsModal();
    setupShopModal();
    setupInventoryModal();
    setupLeaderboardModal();
    setupProfileModal();
    setupModalitaModal();
    setupSfideModal();

    // ===== SETUP ANIMAZIONI =====
    setupAnimazioni();

    // ===== SETUP EVENTI SPECIALI =====
    setupEventiSpeciali();
    const evento = checkEventoSpeciale();
    if (evento) {
        renderPannelloEvento();
    }

    // ===== SETUP PWA =====
    inizializzaPWA();

    // Richiedi permessi notifiche dopo 5 secondi
    setTimeout(() => {
        richiediPermessiNotifiche();
    }, 5000);

    // ===== SETUP TEMI =====
    setupThemeListeners();
    const temaSalvato = caricaTema();
    applyTheme(temaSalvato);

    // ===== CARICA STATO SALVATO =====
    const versioneSalvata = caricaUltimaVersione();
    if (versioneSalvata > 0) {
        versione = versioneSalvata;
        const btnVersione = document.getElementById(`Versione${versioneSalvata}`);
        if (btnVersione) {
            versioni.forEach(b => b.classList.remove("active"));
            btnVersione.classList.add("active");
            aggiornaMaxBombe();
        }
    }

    numBombe = caricaUltimaBombeCount();
    numBombeInput.value = numBombe;

    totalescommessa = caricaUltimaScommessa();
    scommessa.value = totalescommessa;

    // ===== INIZIALIZZA UI =====
    inizializzaSaldo();
    aggiornaRischio(numBombe, getTotaleCelleCorrente());
    aggiornaMoltiplicatoreCorrente();
    aggiornaUIStatistiche();
    updateLevelDisplay();
    updateAchievementsButton();

    // ===== MISSIONI E BADGE =====
    checkResetMissioni();
    aggiornaBadgeMissioni();

    // Daily bonus
    checkDailyBonus();

    // Tutorial per nuovi utenti
    const tutorialCompleted = isTutorialCompleted();
    const hasLastLogin = getLastLogin() !== '';

    if (!tutorialCompleted && !hasLastLogin) {
        setTimeout(() => {
            const tutorialModal = document.getElementById('tutorialModal');
            if (tutorialModal) {
                tutorialModal.style.display = 'flex';
                import('./modules/tutorial.js').then(t => t.showTutorialStep(0));
            }
        }, 1000);
    }

    // ===== RIPRISTINO PARTITA IN CORSO =====
    const stato = caricaStatoGioco();
    if (stato && stato.inGioco) {
        console.log('🔄 Ripristino partita in corso...');

        // IMPORTANTE: Aggiorna le variabili globali
        inGioco = true;
        versione = stato.versione;
        numBombe = stato.numBombe;
        totalescommessa = stato.totalescommessa;
        cmoltiplicatore = stato.cmoltiplicatore;
        trovati = stato.trovati;
        bombe = stato.bombe;
        cliccata = stato.cliccata;

        // Aggiorna UI
        scommessa.value = totalescommessa;
        numBombeInput.value = numBombe;

        versioni.forEach(b => b.classList.remove("active"));
        document.getElementById(`Versione${versione}`)?.classList.add("active");

        aggiornaMaxBombe();
        aggiornaMoltiplicatoreCorrente();

        // Ricrea griglia
        const grid = document.getElementById("grid");
        const totaleCelle = getTotaleCelleCorrente();

        grid.style.gridTemplateColumns =
            versione === 1 ? "repeat(3, 1fr)" :
                versione === 2 ? "repeat(4, 1fr)" :
                    "repeat(5, 1fr)";

        // Ottieni icone evento
        const icone = getIconeEvento();

        celle = []; // Reset array celle

        for (let i = 0; i < totaleCelle; i++) {
            const cella = document.createElement("button");
            cella.id = "cella_" + i;
            grid.appendChild(cella);
            celle.push(cella);

            if (cliccata[i]) {
                // Cella già scoperta
                cella.innerHTML = "";
                if (bombe.includes(i)) {
                    cella.classList.add("bomb-reveal");
                    cella.innerHTML = icone.bomba;
                } else {
                    cella.classList.add("diamond-reveal");
                    cella.innerHTML = icone.diamante;
                }
            } else {
                // Cella da scoprire
                const img = document.createElement("img");
                img.src = getThemeImage(getCurrentTheme());
                img.classList.add("cella-img");
                cella.appendChild(img);

                // Event listener
                cella.addEventListener("click", () => handleCellaClick(i, cella, totaleCelle));
            }
        }

        showNotification('🔄 Partita ripristinata!', 'info');
    }

    // ===== TRACKING =====
    trackScreen('Home');

    // (Opzionale) Genera leaderboard fake per testing
    // generaLeaderboardFake();

    console.log('✅ Gioco v4.0 inizializzato con successo!');
    console.log(`👤 Giocatore: ${getNickname()} ${getAvatar()}`);
});
