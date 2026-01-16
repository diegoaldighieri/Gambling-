// ===== CACCIA AL TESORO v4.2 - FILE PRINCIPALE CON FIX =====

// ===== IMPORT ANTI-CHEAT (PRIMO!) =====
import { AntiCheat } from './modules/antiCheat.js';

// Inizializza anti-cheat immediatamente
AntiCheat.initialize();

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

// ===== IMPORT MODULI AVANZATI =====
import {
    getMissioniGiornaliere,
    aggiornaProgressoMissione,
    checkResetMissioni,
    setupMissionsModal,
    aggiornaBadgeMissioni,
    renderMissioni
} from './modules/missions.js';

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

import {
    setupLeaderboardModal,
    setupProfileModal,
    inviaScore,
    getNickname,
    getAvatar
} from './modules/leaderboard.js';

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

import {
    checkEventoSpeciale,
    setupEventiSpeciali,
    getEventoAttivo,
    getIconeEvento,
    getBonusMoltiplicatoreEvento,
    aggiornaProgressoEvento,
    renderPannelloEvento
} from './modules/events.js';

import {
    inizializzaPWA,
    richiediPermessiNotifiche,
    trackEvent,
    trackScreen
} from './modules/pwa.js';

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
let gameStartTime = 0;

// ===== ESPORTA FUNZIONI GLOBALI =====
window.updateLevelDisplay = updateLevelDisplay;
window.closePopup = closePopup;
window.closeDailyBonus = closeDailyBonus;
window.shareResult = () => shareResult(totalescommessa * cmoltiplicatore, versione, numBombe);
window.AntiCheat = AntiCheat;

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
    const totaleCelle = getTotaleCelleCorrente();

    // FIX: Calcola il moltiplicatore corretto basato su diamanti trovati
    const moltiplicatoreBase = getMoltiplicatorePerDiamanti(trovati, totaleCelle, numBombe);

    // Applica bonus
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const bonusEvento = getBonusMoltiplicatoreEvento();
    const bonusModalita = getBonusModalita();
    const bonusPowerup = getBonusMoltiplicatoreAttivo();

    const moltiplicatoreTotale = moltiplicatoreBase * levelMultiplier * bonusEvento * bonusModalita * (1 + bonusPowerup);

    aggiornaMoltiplicatore(
        moltiplicatoreTotale,
        totalescommessa,
        trovati,
        totaleCelle,
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
        cliccata,
        gameStartTime
    };
    salvaStato(stato);
}

// ===== GENERAZIONE CELLE CON ANTI-CHEAT =====
function generacelle() {
    const totaleCelle = getTotaleCelleCorrente();
    const balance = getCaramelle();

    // ANTI-CHEAT: Validazione completa
    const startTime = AntiCheat.validateGameStart(
        totalescommessa,
        balance,
        numBombe,
        totaleCelle
    );

    if (!startTime) {
        showNotification('❌ Impossibile avviare il gioco: parametri non validi', 'error');
        return;
    }

    if (!validateBet(totalescommessa, balance)) {
        return;
    }

    if (versione === 0) {
        showNotification('⚠️ Seleziona una dimensione della griglia!', 'warning');
        return;
    }

    playSound('click');

    // Salva timestamp
    gameStartTime = startTime;

    // Reset gioco
    celle.forEach(c => c.remove());
    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;
    cmoltiplicatore = 1;
    aggiornaMoltiplicatoreCorrente();

    const grid = document.getElementById("grid");

    if (totaleCelle === 0) return;

    inGioco = true;

    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

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

    // ANTI-CHEAT: Genera bombe in modo sicuro
    bombe = AntiCheat.generateSecureBombs(totaleCelle, numBombe);

    if (bombe.length === 0) {
        showNotification('❌ Errore nella generazione del gioco', 'error');
        inGioco = false;
        return;
    }

    // Ottieni icone evento
    const icone = getIconeEvento();

    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => handleCellaClick(index, cella, totaleCelle, icone));
    });

    trackEvent('game_started', {
        version: versione,
        bombs: numBombe,
        bet: totalescommessa
    });
}

// ===== GESTIONE CLICK CELLA CON ANTI-CHEAT =====
function handleCellaClick(index, cella, totaleCelle, icone) {
    if (cliccata[index] || !inGioco) return;

    // ANTI-CHEAT: Valida velocità click
    if (!AntiCheat.validateClick()) {
        showNotification('⚠️ Rallenta i click!', 'warning');
        return;
    }

    cliccata[index] = true;

    cella.classList.add('revealing');

    setTimeout(() => {
        cella.innerHTML = "";

        if (bombe.includes(index)) {
            // BOMBA
            handleBombClick(cella, totaleCelle, icone);
        } else {
            // DIAMANTE
            handleDiamondClick(cella, totaleCelle, icone);
        }
    }, 300);

    salvaStatoGioco();
}

function handleBombClick(cella, totaleCelle, icone) {
    inGioco = false;
    playSound('bomb');
    cella.classList.remove('revealing');
    cella.classList.add('bomb-reveal');
    cella.innerHTML = icone.bomba;

    // Animazione esplosione
    esplodiBomba(cella);

    const gridWrapper = document.querySelector('.grid-wrapper');
    gridWrapper.classList.add('shake');
    setTimeout(() => gridWrapper.classList.remove('shake'), 500);

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
        const newBalance = getCaramelle() - totalescommessa;
        setCaramelle(Math.max(0, newBalance));

        document.getElementById("statCelleTrovate").textContent = trovati;

        aggiornaStatistiche('persa', 0, totalescommessa);
        updateStreak(false);
        aggiornaProgressoMissione('gioca_partite', 1);
        sconfittaSurvival();

        resetStatoGioco();
        document.getElementById("overlay").style.display = "flex";

        trackEvent('game_lost', {
            diamonds_found: trovati,
            bet: totalescommessa
        });
    }, 1000);
}

function handleDiamondClick(cella, totaleCelle, icone) {
    playSound('diamond');
    cella.classList.remove('revealing');
    cella.classList.add('diamond-reveal');

    // Effetti particelle
    creaParticelle(cella, icone.diamante);

    if (trovati >= 2) {
        cella.classList.add('combo-hit');
        mostraCombo(trovati);
    }

    cella.innerHTML = icone.diamante;
    trovati++;

    // FIX: Calcola il moltiplicatore corretto
    cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati, totaleCelle, numBombe);
    aggiornaMoltiplicatoreCorrente();
    checkAchievements();

    // Progresso missioni
    aggiornaProgressoMissione('trova_diamanti', 1);
    diamanteTrovatoTimeAttack();
    diamanteTrovatoEndless();

    const celleSicureTotali = totaleCelle - numBombe;

    if (trovati === celleSicureTotali) {
        handleGameWin(totaleCelle, icone);
    }
}

// ===== GESTIONE VITTORIA CON ANTI-CHEAT =====
function handleGameWin(totaleCelle, icone) {
    inGioco = false;

    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const bonusEvento = getBonusMoltiplicatoreEvento();
    const bonusModalita = getBonusModalita();
    const bonusPowerup = getBonusMoltiplicatoreAttivo();

    const moltiplicatoreTotale = cmoltiplicatore * levelMultiplier * bonusEvento * bonusModalita * (1 + bonusPowerup);
    const premio = Math.floor(totalescommessa * moltiplicatoreTotale);

    // ANTI-CHEAT: Valida vincita
    if (!AntiCheat.validateGameEnd(totalescommessa, moltiplicatoreTotale, premio, true, gameStartTime)) {
        console.error('⚠️ Vincita non valida rilevata');
        showNotification('❌ Errore nella validazione della vincita', 'error');
        resetStatoGioco();
        inGioco = false;
        return;
    }

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
        playSound('win');
        celebraVittoria();

        setCaramelle(getCaramelle() + premio);
        document.getElementById("statVincita").textContent = premio;

        aggiornaStatistiche('vinta', premio, totalescommessa);
        updateStreak(true);
        checkAchievements();

        // Progresso missioni ed eventi
        aggiornaProgressoMissione('vinci_partite', 1);
        aggiornaProgressoMissione('vinci_monete', premio);
        aggiornaProgressoEvento(1, premio);
        vittoriaSurvival();

        // Leaderboard
        inviaScore(premio);

        // Powerups - FIX: consuma tutti i powerup temporanei attivi
        const inventario = JSON.parse(localStorage.getItem('inventario') || '{"attivi":{}}');
        Object.keys(inventario.attivi || {}).forEach(powerupId => {
            consumaPowerupTemporaneo(powerupId);
        });

        resetStatoGioco();
        document.getElementById("overlay2").style.display = "flex";

        trackEvent('game_won', {
            prize: premio,
            multiplier: moltiplicatoreTotale,
            diamonds: trovati
        });
    }, 1200);
}

// ===== CASHOUT CON ANTI-CHEAT =====
function handleCashout() {
    if (!inGioco) return;

    if (trovati === 0) {
        showNotification('❌ Devi scoprire almeno una cella prima di ritirare!', 'error');
        return;
    }

    playSound('cashout');

    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const bonusEvento = getBonusMoltiplicatoreEvento();
    const bonusModalita = getBonusModalita();
    const bonusPowerup = getBonusMoltiplicatoreAttivo();

    const moltiplicatoreTotale = cmoltiplicatore * levelMultiplier * bonusEvento * bonusModalita * (1 + bonusPowerup);
    const premio = Math.floor(totalescommessa * moltiplicatoreTotale);
    const profitto = premio - totalescommessa;

    // ANTI-CHEAT: Valida cashout
    if (!AntiCheat.validateGameEnd(totalescommessa, moltiplicatoreTotale, premio, true, gameStartTime)) {
        console.error('⚠️ Cashout non valido');
        showNotification('❌ Errore nella validazione del cashout', 'error');
        return;
    }

    const icone = getIconeEvento();

    // FIX: Ritira correttamente il profitto
    setCaramelle(getCaramelle() + profitto);
    document.getElementById("statCashout").textContent = premio;

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
    checkAchievements();
    aggiornaProgressoMissione('cashout_partite', 1);
    aggiornaProgressoEvento(1, premio);
    inviaScore(premio);

    // FIX: consuma tutti i powerup temporanei attivi
    const inventario = JSON.parse(localStorage.getItem('inventario') || '{"attivi":{}}');
    Object.keys(inventario.attivi || {}).forEach(powerupId => {
        consumaPowerupTemporaneo(powerupId);
    });

    resetStatoGioco();
    inGioco = false;

    setTimeout(() => {
        document.getElementById("overlay3").style.display = "flex";
    }, 500);

    trackEvent('game_cashout', {
        prize: premio,
        multiplier: moltiplicatoreTotale,
        diamonds: trovati
    });
}

// ===== CHIUSURA POPUP =====
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
    gameStartTime = 0;

    if (totalescommessa > getCaramelle()) {
        totalescommessa = 0;
        scommessa.value = 0;
    }

    aggiornaMoltiplicatoreCorrente();
    stopTimeAttack();
}

// ===== EVENT LISTENERS =====

// Selezione versione
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

// Controlli bombe
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

// Verifica integrità periodica
setInterval(() => {
    if (!AntiCheat.verifyIntegrity()) {
        console.warn('⚠️ Data integrity check failed');
        showNotification('⚠️ Rilevata possibile manomissione dei dati', 'warning');
    }
}, 60000);

// ===== INIZIALIZZAZIONE =====
console.log('🎮 Caccia al Tesoro v4.2 (Fixed Edition) - Inizializzazione...');

// Import dinamici
import('./modules/modals.js').then(modals => {
    modals.setupModals();
});

import('./modules/tutorial.js').then(tutorial => {
    tutorial.setupTutorial();
});

// Inizializza al caricamento
window.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Caricamento dati salvati...');

    // Setup moduli
    setupMissionsModal();
    setupShopModal();
    setupInventoryModal();
    setupLeaderboardModal();
    setupProfileModal();
    setupModalitaModal();
    setupSfideModal();
    setupAnimazioni();
    setupEventiSpeciali();

    const evento = checkEventoSpeciale();
    if (evento) {
        renderPannelloEvento();
    }

    inizializzaPWA();

    setTimeout(() => {
        richiediPermessiNotifiche();
    }, 5000);

    // Setup temi
    setupThemeListeners();
    const temaSalvato = caricaTema();
    applyTheme(temaSalvato);

    // Carica stato salvato
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

    // Inizializza UI
    inizializzaSaldo();
    aggiornaRischio(numBombe, getTotaleCelleCorrente());
    aggiornaMoltiplicatoreCorrente();
    aggiornaUIStatistiche();
    updateLevelDisplay();
    updateAchievementsButton();

    checkResetMissioni();
    aggiornaBadgeMissioni();
    checkDailyBonus();

    // Tutorial
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

    // FIX: Ripristino partita in corso con gestione corretta
    const stato = caricaStatoGioco();
    if (stato && stato.inGioco) {
        console.log('🔄 Ripristino partita in corso...');

        inGioco = true;
        versione = stato.versione;
        numBombe = stato.numBombe;
        totalescommessa = stato.totalescommessa;
        cmoltiplicatore = stato.cmoltiplicatore || 1;
        trovati = stato.trovati;
        bombe = stato.bombe || [];
        cliccata = stato.cliccata || [];
        gameStartTime = stato.gameStartTime || Date.now();

        scommessa.value = totalescommessa;
        numBombeInput.value = numBombe;

        versioni.forEach(b => b.classList.remove("active"));
        document.getElementById(`Versione${versione}`)?.classList.add("active");

        aggiornaMaxBombe();

        // FIX: Ricalcola il moltiplicatore corretto dopo il ripristino
        cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati, getTotaleCelleCorrente(), numBombe);
        aggiornaMoltiplicatoreCorrente();

        const grid = document.getElementById("grid");
        const totaleCelle = getTotaleCelleCorrente();

        grid.style.gridTemplateColumns =
            versione === 1 ? "repeat(3, 1fr)" :
                versione === 2 ? "repeat(4, 1fr)" :
                    "repeat(5, 1fr)";

        const icone = getIconeEvento();
        celle = [];

        for (let i = 0; i < totaleCelle; i++) {
            const cella = document.createElement("button");
            cella.id = "cella_" + i;
            grid.appendChild(cella);
            celle.push(cella);

            if (cliccata[i]) {
                cella.innerHTML = "";
                if (bombe.includes(i)) {
                    cella.classList.add("bomb-reveal");
                    cella.innerHTML = icone.bomba;
                } else {
                    cella.classList.add("diamond-reveal");
                    cella.innerHTML = icone.diamante;
                }
            } else {
                const img = document.createElement("img");
                img.src = getThemeImage(getCurrentTheme());
                img.classList.add("cella-img");
                cella.appendChild(img);

                cella.addEventListener("click", () => handleCellaClick(i, cella, totaleCelle, icone));
            }
        }

        showNotification('🔄 Partita ripristinata!', 'info');
    }

    trackScreen('Home');

    console.log('✅ Gioco v4.2 inizializzato con successo!');
    console.log(`👤 Giocatore: ${getNickname()} ${getAvatar()}`);
    console.log(`🛡️ Anti-cheat: ${AntiCheat.getDebugInfo().version}`);

    // Debug console helper
    console.log('💡 Usa showAntiCheatInfo() per vedere info anti-cheat');
});
