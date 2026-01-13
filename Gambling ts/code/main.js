// ===== CACCIA AL TESORO - FILE PRINCIPALE =====

// Import moduli
import { playSound } from './modules/audio.js';
import { showNotification } from './modules/audio.js';
import { getCaramelle, setCaramelle, inizializzaSaldo } from './modules/balance.js';
import { checkDailyBonus, closeDailyBonus } from './modules/dailyBonus.js';
import { getPlayerLevel, updateLevelDisplay } from './modules/levels.js';
import { updateAchievementsButton, renderAchievements, checkAchievements } from './modules/achievements.js';
import { aggiornaStatistiche, aggiornaUIStatistiche, resetStatistiche } from './modules/statistics.js';
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
    setTutorialCompleted,
    getLastLogin
} from './modules/storage.js';
import { levels } from './modules/config.js';

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

// Esporta per uso globale
window.updateLevelDisplay = updateLevelDisplay;

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
    playSound('bomb');
    cella.classList.remove('revealing');
    cella.classList.add('bomb-reveal');
    cella.innerHTML = "💣";

    const gridWrapper = document.querySelector('.grid-wrapper');
    gridWrapper.classList.add('shake');
    setTimeout(() => gridWrapper.classList.remove('shake'), 500);

    setTimeout(() => {
        celle.forEach((c, i) => {
            if (!cliccata[i]) {
                c.innerHTML = "";
                if (bombe.includes(i)) {
                    c.classList.add('bomb-reveal-secondary');
                    c.innerHTML = "💣";
                } else {
                    c.classList.add('diamond-reveal-missed');
                    c.innerHTML = "💎";
                }
            }
        });
    }, 300);

    setTimeout(() => {
        setCaramelle(getCaramelle() - totalescommessa);
        document.getElementById("statCelleTrovate").textContent = trovati;

        aggiornaStatistiche('persa', 0, totalescommessa);
        updateStreak(false);

        resetStatoGioco();
        document.getElementById("overlay").style.display = "flex";
    }, 1000);
}

function handleDiamondClick(cella, totaleCelle) {
    playSound('diamond');
    cella.classList.remove('revealing');
    cella.classList.add('diamond-reveal');

    if (trovati >= 2) {
        cella.classList.add('combo-hit');
    }

    cella.innerHTML = "💎";
    trovati++;

    cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati, totaleCelle, numBombe);
    aggiornaMoltiplicatoreCorrente();

    const gameState = { trovati, inGioco, versione, numBombe };
    checkAchievements(gameState);

    const celleSicureTotali = totaleCelle - numBombe;
    if (trovati === celleSicureTotali) {
        handleVictory();
    }
}

function handleVictory() {
    inGioco = false;
    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const premio = Math.floor(totalescommessa * cmoltiplicatore * levelMultiplier);

    setTimeout(() => {
        celle.forEach((c, i) => {
            if (!cliccata[i]) {
                c.innerHTML = "";
                if (bombe.includes(i)) {
                    c.classList.add('bomb-reveal-win');
                    c.innerHTML = "💣";
                }
            }
        });
    }, 300);

    setTimeout(() => {
        playSound('win');
        setCaramelle(getCaramelle() + premio);
        document.getElementById("statVincita").textContent = premio;

        aggiornaStatistiche('vinta', premio, totalescommessa);
        updateStreak(true);

        const gameState = { trovati, inGioco: false, versione, numBombe };
        checkAchievements(gameState);

        resetStatoGioco();
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

    const levelMultiplier = levels[getPlayerLevel()].multiplier;
    const premio = Math.floor(totalescommessa * cmoltiplicatore * levelMultiplier);
    setCaramelle(getCaramelle() + premio - totalescommessa);

    document.getElementById("statCashout").textContent = premio;

    celle.forEach((c, i) => {
        if (!cliccata[i]) {
            c.innerHTML = "";
            if (bombe.includes(i)) {
                c.classList.add('bomb-reveal-cashout');
                c.innerHTML = "💣";
            } else {
                c.classList.add('diamond-reveal-missed');
                c.innerHTML = "💎";
            }
        }
    });

    aggiornaStatistiche('cashout', premio, totalescommessa);
    updateStreak(true);

    const gameState = { trovati, inGioco: false, versione, numBombe };
    checkAchievements(gameState);

    resetStatoGioco();
    inGioco = false;

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

// Esporta funzioni globali
window.closePopup = closePopup;
window.closeDailyBonus = closeDailyBonus;
window.shareResult = () => {
    shareResult(totalescommessa * cmoltiplicatore, versione, numBombe);
};

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
console.log('🎮 Caccia al Tesoro - Inizializzazione...');

import('./modules/modals.js').then(modals => {
    modals.setupModals();
});

import('./modules/tutorial.js').then(tutorial => {
    tutorial.setupTutorial();
});

// Inizializza al caricamento pagina
window.addEventListener('DOMContentLoaded', () => {
    console.log('📊 Caricamento dati salvati...');

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
                    cella.innerHTML = "💣";
                } else {
                    cella.classList.add("diamond-reveal");
                    cella.innerHTML = "💎";
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

    console.log('✅ Gioco inizializzato!');
});