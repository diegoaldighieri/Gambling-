// ===== RIPRISTINO PARTITA =====

import { caricaStatoGioco } from './storage.js';
import { getTotaleCelle } from './utils.js';

export async function ripristinaPartita(context) {
    const {
        celle, getCurrentTheme, getThemeImage, getMoltiplicatorePerDiamanti,
        aggiornaMoltiplicatoreCorrente, salvaStatoGioco,
        aggiornaStatistiche, updateStreak, checkAchievements,
        resetStatoGioco, setCaramelle, getCaramelle, playSound,
        showNotification, levels, getPlayerLevel
    } = context;

    const stato = caricaStatoGioco();
    if (!stato || !stato.inGioco) return null;

    console.log('🔄 Ripristino partita in corso...');

    const { versione, numBombe, totalescommessa, cmoltiplicatore, trovati, bombe, cliccata } = stato;

    // Prepara UI
    const versioni = [
        document.getElementById("Versione1"),
        document.getElementById("Versione2"),
        document.getElementById("Versione3")
    ];

    versioni.forEach(b => b.classList.remove("active"));
    document.getElementById(`Versione${versione}`)?.classList.add("active");

    document.getElementById("scommessa").value = totalescommessa;
    document.getElementById("numBombe").value = numBombe;

    // Ricrea griglia
    const grid = document.getElementById("grid");
    const totaleCelle = getTotaleCelle(versione);

    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
        versione === 2 ? "repeat(4, 1fr)" :
        "repeat(5, 1fr)";

    const nuoveCelle = [];

    for (let i = 0; i < totaleCelle; i++) {
        const cella = document.createElement("button");
        cella.id = "cella_" + i;
        grid.appendChild(cella);
        nuoveCelle.push(cella);

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

            // Aggiungi event listener
            cella.addEventListener("click", () => {
                handleRestoredCellaClick(i, cella, {
                    cliccata, bombe, totaleCelle, numBombe, trovati,
                    cmoltiplicatore, totalescommessa, versione,
                    nuoveCelle, getMoltiplicatorePerDiamanti,
                    aggiornaMoltiplicatoreCorrente, salvaStatoGioco,
                    aggiornaStatistiche, updateStreak, checkAchievements,
                    resetStatoGioco, setCaramelle, getCaramelle, playSound,
                    levels, getPlayerLevel
                });
            });
        }
    }

    showNotification('🔄 Partita ripristinata!', 'info');

    return {
        inGioco: true,
        versione,
        numBombe,
        totalescommessa,
        cmoltiplicatore,
        trovati,
        bombe,
        cliccata,
        celle: nuoveCelle
    };
}

function handleRestoredCellaClick(i, cella, context) {
    const {
        cliccata, bombe, totaleCelle, numBombe, trovati,
        cmoltiplicatore, totalescommessa, versione,
        nuoveCelle, getMoltiplicatorePerDiamanti,
        aggiornaMoltiplicatoreCorrente, salvaStatoGioco,
        aggiornaStatistiche, updateStreak, checkAchievements,
        resetStatoGioco, setCaramelle, getCaramelle, playSound,
        levels, getPlayerLevel
    } = context;

    let inGioco = true;
    let trovatiLocal = trovati;
    let cmoltiplicatoreLocal = cmoltiplicatore;

    if (cliccata[i] || !inGioco) return;
    cliccata[i] = true;

    cella.classList.add('revealing');

    setTimeout(() => {
        cella.innerHTML = "";

        if (bombe.includes(i)) {
            // BOMBA
            inGioco = false;
            playSound('bomb');
            cella.classList.remove('revealing');
            cella.classList.add('bomb-reveal');
            cella.innerHTML = "💣";

            const gridWrapper = document.querySelector('.grid-wrapper');
            gridWrapper.classList.add('shake');
            setTimeout(() => gridWrapper.classList.remove('shake'), 500);

            setTimeout(() => {
                nuoveCelle.forEach((c, idx) => {
                    if (!cliccata[idx]) {
                        c.innerHTML = "";
                        if (bombe.includes(idx)) {
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
                document.getElementById("statCelleTrovate").textContent = trovatiLocal;
                aggiornaStatistiche('persa', 0, totalescommessa);
                updateStreak(false);
                resetStatoGioco();
                document.getElementById("overlay").style.display = "flex";
            }, 1000);

            return;
        }

        // DIAMANTE
        playSound('diamond');
        cella.classList.remove('revealing');
        cella.classList.add('diamond-reveal');

        if (trovatiLocal >= 2) {
            cella.classList.add('combo-hit');
        }

        cella.innerHTML = "💎";
        trovatiLocal++;

        cmoltiplicatoreLocal = getMoltiplicatorePerDiamanti(trovatiLocal, totaleCelle, numBombe);
        aggiornaMoltiplicatoreCorrente();
        
        const gameState = { trovati: trovatiLocal, inGioco, versione, numBombe };
        checkAchievements(gameState);

        const celleSicureTotali = totaleCelle - numBombe;
        if (trovatiLocal === celleSicureTotali) {
            inGioco = false;
            const levelMultiplier = levels[getPlayerLevel()].multiplier;
            const premio = Math.floor(totalescommessa * cmoltiplicatoreLocal * levelMultiplier);

            setTimeout(() => {
                nuoveCelle.forEach((c, idx) => {
                    if (!cliccata[idx]) {
                        c.innerHTML = "";
                        if (bombe.includes(idx)) {
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
                checkAchievements({ trovati: trovatiLocal, inGioco: false, versione, numBombe });
                resetStatoGioco();
                document.getElementById("overlay2").style.display = "flex";
            }, 1200);
        }
    }, 300);
    
    salvaStatoGioco();
}
