// DOM Elementi
const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
const accontentati = document.getElementById("accontentati");
const numBombeInput = document.getElementById("numBombe");
const decreaseBombs = document.getElementById("decreaseBombs");
const increaseBombs = document.getElementById("increaseBombs");
const riskLevel = document.getElementById("riskLevel");

// Variabili gioco
let versione = 0;
let celle = [];
let bombe = [];
let cliccata = [];
let trovati = 0;
let inGioco = false;
let numBombe = 1;

let totalescommessa = 0;
let cmoltiplicatore = 1;

let currentTheme = 'default';

// ===== FUNZIONI LOCALSTORAGE =====

function salvaCaramelle(n) {
    localStorage.setItem('caramelle', n.toString());
}

function caricaCaramelle() {
    const saved = localStorage.getItem('caramelle');
    return saved !== null ? parseInt(saved) : 500;
}

function salvaTema(tema) {
    localStorage.setItem('tema', tema);
}

function caricaTema() {
    return localStorage.getItem('tema') || 'default';
}

function salvaUltimaScommessa(scommessa) {
    localStorage.setItem('ultimaScommessa', scommessa.toString());
}

function caricaUltimaScommessa() {
    const saved = localStorage.getItem('ultimaScommessa');
    return saved !== null ? parseInt(saved) : 0;
}

function salvaUltimaBombeCount(count) {
    localStorage.setItem('ultimeBombe', count.toString());
}

function caricaUltimaBombeCount() {
    const saved = localStorage.getItem('ultimeBombe');
    return saved !== null ? parseInt(saved) : 1;
}

function salvaUltimaVersione(ver) {
    localStorage.setItem('ultimaVersione', ver.toString());
}

function caricaUltimaVersione() {
    const saved = localStorage.getItem('ultimaVersione');
    return saved !== null ? parseInt(saved) : 0;
}

// ===== NUOVE FUNZIONI STATISTICHE =====

function caricaStatistiche() {
    const saved = localStorage.getItem('statistiche');
    if (saved) {
        return JSON.parse(saved);
    }
    return {
        partiteGiocate: 0,
        partiteVinte: 0,
        partitePerse: 0,
        totaleScommesso: 0,
        totaleVinto: 0,
        ultimaVincita: 0,
        vincitaMassima: 0,
        perditaMassima: 0
    };
}

function salvaStatistiche(stats) {
    localStorage.setItem('statistiche', JSON.stringify(stats));
}

function aggiornaStatistiche(tipo, importo) {
    const stats = caricaStatistiche();

    stats.partiteGiocate++;
    stats.totaleScommesso += totalescommessa;

    if (tipo === 'vinta') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    } else if (tipo === 'persa') {
        stats.partitePerse++;
        stats.ultimaVincita = -totalescommessa;

        if (totalescommessa > stats.perditaMassima) {
            stats.perditaMassima = totalescommessa;
        }
    } else if (tipo === 'cashout') {
        stats.partiteVinte++;
        stats.totaleVinto += importo;
        stats.ultimaVincita = importo;

        if (importo > stats.vincitaMassima) {
            stats.vincitaMassima = importo;
        }
    }

    salvaStatistiche(stats);
    aggiornaUIStatistiche();
}

function aggiornaUIStatistiche() {
    const stats = caricaStatistiche();

    document.getElementById('partiteGiocate').textContent = stats.partiteGiocate;
    document.getElementById('partiteVinte').textContent = stats.partiteVinte;
    document.getElementById('partitePerse').textContent = stats.partitePerse;
    document.getElementById('totaleScommesso').textContent = stats.totaleScommesso;
    document.getElementById('totaleVinto').textContent = stats.totaleVinto;
    document.getElementById('vincitaMassima').textContent = stats.vincitaMassima;
    document.getElementById('perditaMassima').textContent = stats.perditaMassima;

    // Ultima vincita con colore
    const ultimaVincitaEl = document.getElementById('ultimaVincita');
    ultimaVincitaEl.textContent = stats.ultimaVincita;

    if (stats.ultimaVincita > 0) {
        ultimaVincitaEl.style.color = '#00cc66';
    } else if (stats.ultimaVincita < 0) {
        ultimaVincitaEl.style.color = '#ef4444';
    } else {
        ultimaVincitaEl.style.color = 'var(--color-primary)';
    }

    // Calcola percentuale vittorie
    const percVittorie = stats.partiteGiocate > 0
        ? ((stats.partiteVinte / stats.partiteGiocate) * 100).toFixed(1)
        : 0;
    document.getElementById('percVittorie').textContent = percVittorie;

    // Calcola profitto netto
    const profittoNetto = stats.totaleVinto - stats.totaleScommesso;
    const profittoNettoEl = document.getElementById('profittoNetto');
    profittoNettoEl.textContent = profittoNetto;

    if (profittoNetto > 0) {
        profittoNettoEl.style.color = '#00cc66';
    } else if (profittoNetto < 0) {
        profittoNettoEl.style.color = '#ef4444';
    } else {
        profittoNettoEl.style.color = 'var(--color-primary)';
    }
}

function resetStatistiche() {
    if (confirm('Sei sicuro di voler resettare tutte le statistiche?')) {
        const statsVuote = {
            partiteGiocate: 0,
            partiteVinte: 0,
            partitePerse: 0,
            totaleScommesso: 0,
            totaleVinto: 0,
            ultimaVincita: 0,
            vincitaMassima: 0,
            perditaMassima: 0
        };
        salvaStatistiche(statsVuote);
        aggiornaUIStatistiche();
        alert('Statistiche resettate!');
    }
}

// Gestione saldo
function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

function setCaramelle(n) {
    if (n < 0) n = 0;
    document.getElementById("caramelle").textContent = n;
    salvaCaramelle(n);
}

// Inizializza caramelle dal storage
setCaramelle(caricaCaramelle());

// Moltiplicatore - Tabelle predefinite
const moltiplicatoriTabelle = {
    "9_1": [1.10, 1.23, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02],
    "9_2": [1.23, 1.57, 2.12, 3.02, 4.50, 7.20, 11.70],
    "9_3": [1.38, 2.12, 3.66, 7.20, 14.40, 31.50],
    "9_4": [1.57, 3.02, 7.20, 18.00, 49.50],
    "9_5": [1.80, 4.50, 14.40, 49.50],
    "9_6": [2.12, 7.20, 31.50],

    "16_1": [1.06, 1.11, 1.18, 1.25, 1.33, 1.42, 1.51, 1.62, 1.74, 1.87, 2.02, 2.20, 2.42, 2.67, 2.96],
    "16_2": [1.11, 1.25, 1.42, 1.62, 1.87, 2.20, 2.67, 3.30, 4.12, 5.28, 6.92, 9.42, 13.20],
    "16_3": [1.18, 1.42, 1.74, 2.20, 2.96, 4.12, 5.97, 9.13, 14.84, 25.74, 49.50, 112.64],
    "16_4": [1.25, 1.62, 2.20, 3.30, 5.28, 9.13, 17.32, 36.30, 88.00, 264.00],
    "16_5": [1.33, 1.87, 2.96, 5.28, 10.56, 24.24, 64.36, 214.50],
    "16_6": [1.42, 2.20, 4.12, 9.13, 24.24, 79.20, 346.50],
    "16_7": [1.51, 2.67, 5.97, 17.32, 64.36, 346.50],
    "16_8": [1.62, 3.30, 9.13, 36.30, 214.50],
    "16_9": [1.74, 4.12, 14.84, 88.00],
    "16_10": [1.87, 5.28, 25.74, 264.00],
    "16_11": [2.02, 6.92, 49.50],
    "16_12": [2.20, 9.42, 112.64],

    "25_1": [1.03, 1.07, 1.10, 1.14, 1.18, 1.22, 1.27, 1.32, 1.37, 1.42, 1.48, 1.54, 1.61, 1.68, 1.76, 1.84, 1.94, 2.03, 2.14, 2.26, 2.40, 2.54, 2.71, 2.90],
    "25_2": [1.07, 1.14, 1.22, 1.32, 1.42, 1.54, 1.68, 1.84, 2.03, 2.26, 2.54, 2.90, 3.36, 4.12, 4.97, 6.13, 7.73, 10.06, 13.66, 19.48, 30.26, 52.51],
    "25_3": [1.10, 1.22, 1.38, 1.57, 1.80, 2.12, 2.51, 3.02, 3.66, 4.50, 5.59, 7.05, 9.04, 11.81, 15.85, 21.94, 31.63, 48.10, 78.47, 140.63, 295.31],
    "25_4": [1.14, 1.32, 1.54, 1.84, 2.26, 2.90, 4.12, 6.13, 10.06, 19.48, 48.10, 140.63, 590.63],
    "25_5": [1.18, 1.42, 1.76, 2.26, 3.13, 4.54, 7.04, 11.79, 21.44, 44.00, 103.13, 288.81, 963.00],
    "25_10": [1.48, 2.54, 5.59, 13.75, 41.27, 151.36, 743.00, 5280.00],
    "25_15": [1.94, 6.13, 30.26, 288.81, 8800.00],
    "25_20": [2.90, 19.48, 577.50, 88000.00],
};

function getMoltiplicatorePerDiamanti(diamantiTrovati) {
    if (diamantiTrovati === 0) return 1.00;

    const totaleCelle = getTotaleCelle();
    const key = `${totaleCelle}_${numBombe}`;

    const tabella = moltiplicatoriTabelle[key];

    if (!tabella) {
        const celleRimaste = totaleCelle - diamantiTrovati;
        const bombeRimaste = numBombe;
        const celleSicure = celleRimaste - bombeRimaste;
        if (celleSicure <= 0) return 1.00;
        const probabilitaSicura = celleSicure / celleRimaste;
        return 1 / probabilitaSicura;
    }

    if (diamantiTrovati > tabella.length) return tabella[tabella.length - 1];

    return tabella[diamantiTrovati - 1];
}

function getTotaleCelle() {
    return versione === 1 ? 9 : versione === 2 ? 16 : versione === 3 ? 25 : 0;
}

function aggiornaMoltiplicatore() {
    const moltiplicatoreEl = document.getElementById("moltiplicatore");
    const vincitaEl = document.getElementById("vincita");
    const celleSicureEl = document.getElementById("celleSicure");
    const totaleCelleEl = document.getElementById("totaleCelle");

    moltiplicatoreEl.textContent = cmoltiplicatore.toFixed(2);
    vincitaEl.textContent = Math.floor(totalescommessa * cmoltiplicatore);

    const totaleCelle = getTotaleCelle();
    const celleSicureTotali = totaleCelle - numBombe;
    celleSicureEl.textContent = trovati;
    totaleCelleEl.textContent = celleSicureTotali;

    if (inGioco && cmoltiplicatore > 1) {
        moltiplicatoreEl.parentElement.classList.add('pulse');
        vincitaEl.parentElement.classList.add('pulse');

        setTimeout(() => {
            moltiplicatoreEl.parentElement.classList.remove('pulse');
            vincitaEl.parentElement.classList.remove('pulse');
        }, 500);
    }
}

// Livello di rischio
function aggiornaRischio() {
    const totaleCelle = getTotaleCelle();
    if (totaleCelle === 0) {
        riskLevel.textContent = "SELEZIONA GRIGLIA";
        riskLevel.className = "risk-indicator";
        return;
    }

    const percentuale = (numBombe / totaleCelle) * 100;

    if (percentuale >= 50) {
        riskLevel.textContent = "ESTREMO 🔥";
        riskLevel.className = "risk-indicator risk-extreme";
    } else if (percentuale >= 40) {
        riskLevel.textContent = "MOLTO ALTO ⚠️";
        riskLevel.className = "risk-indicator risk-very-high";
    } else if (percentuale >= 30) {
        riskLevel.textContent = "ALTO 📈";
        riskLevel.className = "risk-indicator risk-high";
    } else if (percentuale >= 20) {
        riskLevel.textContent = "MEDIO ⚖️";
        riskLevel.className = "risk-indicator risk-medium";
    } else if (percentuale >= 10) {
        riskLevel.textContent = "BASSO 📉";
        riskLevel.className = "risk-indicator risk-low";
    } else {
        riskLevel.textContent = "MOLTO BASSO 🛡️";
        riskLevel.className = "risk-indicator risk-very-low";
    }
}

// Selezione bombe
function aggiornaMaxBombe() {
    const totaleCelle = getTotaleCelle();
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

    aggiornaRischio();
    aggiornaMoltiplicatore();
}

decreaseBombs.addEventListener("click", () => {
    if (inGioco) return;

    const min = parseInt(numBombeInput.min);
    if (numBombe > min) {
        numBombe--;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio();
        aggiornaMoltiplicatore();
    }
});

increaseBombs.addEventListener("click", () => {
    if (inGioco) return;

    const max = parseInt(numBombeInput.max);
    if (numBombe < max) {
        numBombe++;
        numBombeInput.value = numBombe;
        salvaUltimaBombeCount(numBombe);
        aggiornaRischio();
        aggiornaMoltiplicatore();
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
    aggiornaRischio();
    aggiornaMoltiplicatore();
});

const versioni = [v1, v2, v3];

versioni.forEach(btn => {
    btn.addEventListener("click", () => {
        if (inGioco) return;
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

v1.addEventListener("click", () => {
    if (!inGioco) {
        versione = 1;
        salvaUltimaVersione(1);
        aggiornaMaxBombe();
    }
});

v2.addEventListener("click", () => {
    if (!inGioco) {
        versione = 2;
        salvaUltimaVersione(2);
        aggiornaMaxBombe();
    }
});

v3.addEventListener("click", () => {
    if (!inGioco) {
        versione = 3;
        salvaUltimaVersione(3);
        aggiornaMaxBombe();
    }
});

// Aggiunta di soldi nella scommessa
const somma5 = document.getElementById("somma5");
const somma10 = document.getElementById("somma10");
const somma50 = document.getElementById("somma50");
const somma100 = document.getElementById("somma100");
const maxbet = document.getElementById("maxbet");
const scommessa = document.getElementById("scommessa");

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
    aggiornaMoltiplicatore();
}

scommessa.addEventListener("input", () => {
    if (inGioco) {
        scommessa.value = totalescommessa;
        return;
    }
    const valore = parseInt(scommessa.value) || 0;
    setTotaleScommessa(valore);
});

function aggiungi(amount) {
    if (inGioco) return;
    setTotaleScommessa(totalescommessa + amount);
}

somma5.addEventListener("click", () => aggiungi(5));
somma10.addEventListener("click", () => aggiungi(10));
somma50.addEventListener("click", () => aggiungi(50));
somma100.addEventListener("click", () => aggiungi(100));
maxbet.addEventListener("click", () => aggiungi(getCaramelle()));

// Temi
function getThemeImage(theme) {
    const themeImages = {
        'default': 'images/gray-square.png',
        'dark': 'images/scuro-square.png',
        'neon': 'images/neon-square.png',
        'forest': 'images/forest-square.png',
        'sunset': 'images/tramonto-square.png',
        'ocean': 'images/oceano-square.png',
        'lava': 'images/lava-square.png',
        'cyberpunk': 'images/cyberpunk-square.png',
        'arctic': 'images/arctic-square.png',
        'goldRush': 'images/gold-square.png',
        'matrix': 'images/matrix-square.png',
        'purpleHaze': 'images/purple-haze-square.png',
    };
    return themeImages[theme] || themeImages['default'];
}

// generazione intero gioco
function generacelle() {
    if (totalescommessa <= 0) {
        alert("Inserisci una puntata!");
        return;
    }

    if (versione === 0) {
        alert("Seleziona una dimensione della griglia!");
        return;
    }

    celle.forEach(c => c.remove());
    celle = [];
    bombe = [];
    cliccata = [];
    trovati = 0;

    cmoltiplicatore = 1;
    aggiornaMoltiplicatore();

    const grid = document.getElementById("grid");
    const totaleCelle = getTotaleCelle();

    if (totaleCelle === 0) return;

    inGioco = true;

    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

    // Crea celle
    for (let i = 0; i < totaleCelle; i++) {
        const cella = document.createElement("button");
        const img = document.createElement("img");

        img.src = getThemeImage(currentTheme);
        img.classList.add("cella-img");

        cella.appendChild(img);
        cella.id = "cella_" + i;

        grid.appendChild(cella);

        celle.push(cella);
        cliccata.push(false);
    }

    // Genera posizione bombe
    bombe = [];
    while (bombe.length < numBombe) {
        const indiceBomba = Math.floor(Math.random() * totaleCelle);
        if (!bombe.includes(indiceBomba)) {
            bombe.push(indiceBomba);
        }
    }

    // Aggiungi eventi quando una cella viene cliccata
    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => {
            if (cliccata[index]) return;
            cliccata[index] = true;

            cella.classList.add('revealing');

            setTimeout(() => {
                cella.innerHTML = "";

                if (bombe.includes(index)) {
                    // BOMBA PRESA
                    cella.classList.remove('revealing');
                    cella.classList.add('bomb-reveal');
                    cella.innerHTML = "💣";

                    const gridWrapper = document.querySelector('.grid-wrapper');
                    gridWrapper.classList.add('shake');
                    setTimeout(() => gridWrapper.classList.remove('shake'), 500);

                    // Rivela tutto
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

                        // AGGIORNA STATISTICHE - PERSA
                        aggiornaStatistiche('persa', 0);

                        inGioco = false;
                        document.getElementById("overlay").style.display = "flex";
                    }, 1000);

                    return;
                }

                // DIAMANTE TROVATO
                cella.classList.remove('revealing');
                cella.classList.add('diamond-reveal');

                if (trovati >= 2) {
                    cella.classList.add('combo-hit');
                }

                cella.innerHTML = "💎";
                trovati++;

                // Usa la tabella dei moltiplicatori
                cmoltiplicatore = getMoltiplicatorePerDiamanti(trovati);
                aggiornaMoltiplicatore();

                // Controlla se tutti i diamanti siano stati trovati
                const celleSicureTotali = totaleCelle - numBombe;
                if (trovati === celleSicureTotali) {
                    // Premio finale senza bonus aggiuntivo
                    const premio = Math.floor(totalescommessa * cmoltiplicatore);

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
                        setCaramelle(getCaramelle() + premio);
                        document.getElementById("statVincita").textContent = premio;

                        // AGGIORNA STATISTICHE - VINTA
                        aggiornaStatistiche('vinta', premio);

                        inGioco = false;
                        document.getElementById("overlay2").style.display = "flex";
                    }, 1200);
                }
            }, 300);
            salvaStatoGioco();

        });
    });
}

start.addEventListener("click", generacelle);

// Close Popup
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

    aggiornaMoltiplicatore();
}

// Cashout
accontentati.addEventListener("click", () => {
    if (!inGioco) return;

    if (trovati === 0) {
        alert("Devi scoprire almeno una cella prima di ritirare!");
        return;
    }

    const premio = Math.floor(totalescommessa * cmoltiplicatore);
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

    // AGGIORNA STATISTICHE - CASHOUT
    aggiornaStatistiche('cashout', premio);

    resetStatoGioco();

    inGioco = false;

    setTimeout(() => {
        document.getElementById("overlay3").style.display = "flex";
    }, 500);
});

// Intero dizionario sui temi e css incluso
const themes = {
    default: {
        primary: '#ffc400',
        primaryHover: '#ffae00',
        secondary: '#00cc66',
        background: '#0b0f1a',
        cardBg: '#111627',
        cellBg: '#1a2030',
        text: '#ffffff',
        textDark: '#000000'
    },
    dark: {
        primary: '#60a5fa',
        primaryHover: '#3b82f6',
        secondary: '#a78bfa',
        background: '#000000',
        cardBg: '#1a1a1a',
        cellBg: '#2a2a2a',
        text: '#f9fafb',
        textDark: '#000000'
    },
    neon: {
        primary: '#ec4899',
        primaryHover: '#db2777',
        secondary: '#06b6d4',
        background: '#0f172a',
        cardBg: '#1e293b',
        cellBg: '#334155',
        text: '#f0abfc',
        textDark: '#0f172a'
    },
    forest: {
        primary: '#10b981',
        primaryHover: '#059669',
        secondary: '#34d399',
        background: '#064e3b',
        cardBg: '#065f46',
        cellBg: '#047857',
        text: '#d1fae5',
        textDark: '#064e3b'
    },
    sunset: {
        primary: '#f59e0b',
        primaryHover: '#d97706',
        secondary: '#ef4444',
        background: '#7c2d12',
        cardBg: '#9a3412',
        cellBg: '#b45309',
        text: '#fef3c7',
        textDark: '#7c2d12'
    },
    ocean: {
        primary: '#0ea5e9',
        primaryHover: '#0284c7',
        secondary: '#06b6d4',
        background: '#0c4a6e',
        cardBg: '#075985',
        cellBg: '#0369a1',
        text: '#e0f2fe',
        textDark: '#0c4a6e'
    },
    cyberpunk: {
        primary: '#ff00ff',
        primaryHover: '#cc00cc',
        secondary: '#00ffff',
        background: '#0a0a0a',
        cardBg: '#1a0a1f',
        cellBg: '#2d1b3d',
        text: '#00ffff',
        textDark: '#0a0a0a'
    },
    lava: {
        primary: '#ff4500',
        primaryHover: '#ff6347',
        secondary: '#ff8c00',
        background: '#1a0000',
        cardBg: '#330000',
        cellBg: '#4d0000',
        text: '#ffcc99',
        textDark: '#1a0000'
    },
    arctic: {
        primary: '#00d4ff',
        primaryHover: '#00bfea',
        secondary: '#b3e5fc',
        background: '#0a1929',
        cardBg: '#1e3a52',
        cellBg: '#2d4f6b',
        text: '#e1f5fe',
        textDark: '#0a1929'
    },
    goldRush: {
        primary: '#ffd700',
        primaryHover: '#ffed4e',
        secondary: '#ffb347',
        background: '#000000',
        cardBg: '#1a1410',
        cellBg: '#2d2416',
        text: '#fff8dc',
        textDark: '#000000'
    },
    purpleHaze: {
        primary: '#9c27b0',
        primaryHover: '#ba68c8',
        secondary: '#e91e63',
        background: '#1a0033',
        cardBg: '#2d0052',
        cellBg: '#3d006b',
        text: '#f3e5f5',
        textDark: '#1a0033'
    },
    matrix: {
        primary: '#00ff00',
        primaryHover: '#00cc00',
        secondary: '#39ff14',
        background: '#000000',
        cardBg: '#001a00',
        cellBg: '#003300',
        text: '#00ff00',
        textDark: '#000000'
    }
};

function applyTheme(themeName) {
    currentTheme = themeName;
    const theme = themes[themeName];
    document.documentElement.style.setProperty('--color-primary', theme.primary);
    document.documentElement.style.setProperty('--color-primary-hover', theme.primaryHover);
    document.documentElement.style.setProperty('--color-secondary', theme.secondary);
    document.documentElement.style.setProperty('--color-background', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
    document.documentElement.style.setProperty('--color-cell-bg', theme.cellBg);
    document.documentElement.style.setProperty('--color-text', theme.text);
    document.documentElement.style.setProperty('--color-text-dark', theme.textDark);

    document.querySelectorAll('.theme-option').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === themeName) {
            btn.classList.add('active');
        }
    });

    salvaTema(themeName);

    if (inGioco) {
        celle.forEach((cella, index) => {
            if (!cliccata[index]) {
                const img = cella.querySelector('img.cella-img');
                if (img) {
                    img.src = getThemeImage(themeName);
                }
            }
        });
    }
}

// Theme eventi
document.getElementById('theme-button').addEventListener('click', () => {
    document.getElementById('theme-menu').classList.toggle('hidden');
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        document.getElementById('theme-menu').classList.add('hidden');
    });
});

// ===== GESTIONE MODALE STATISTICHE =====
const statsButton = document.getElementById('statsButton');
const statsModal = document.getElementById('statsModal');
const closeStatsBtn = document.getElementById('closeStats');
const resetStatsBtn = document.getElementById('resetStats');

if (statsButton) {
    statsButton.addEventListener('click', () => {
        statsModal.style.display = 'flex';
        aggiornaUIStatistiche();
    });
}

if (closeStatsBtn) {
    closeStatsBtn.addEventListener('click', () => {
        statsModal.style.display = 'none';
    });
}

if (resetStatsBtn) {
    resetStatsBtn.addEventListener('click', resetStatistiche);
}

// Chiudi modale cliccando fuori
statsModal?.addEventListener('click', (e) => {
    if (e.target === statsModal) {
        statsModal.style.display = 'none';
    }
});

// ===== INIZIALIZZAZIONE CON DATI SALVATI =====

// Carica tema salvato
const temaSalvato = caricaTema();
applyTheme(temaSalvato);

// Carica ultima versione
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

// Carica ultimo numero bombe
const bombeSalvate = caricaUltimaBombeCount();
numBombe = bombeSalvate;
numBombeInput.value = bombeSalvate;

// Carica ultima scommessa
const scommessaSalvata = caricaUltimaScommessa();
totalescommessa = scommessaSalvata;
scommessa.value = scommessaSalvata;

aggiornaRischio();
aggiornaMoltiplicatore();
aggiornaUIStatistiche();

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
    localStorage.setItem("statoGioco", JSON.stringify(stato));
}

function caricaStatoGioco() {
    const saved = localStorage.getItem("statoGioco");
    return saved ? JSON.parse(saved) : null;
}

function resetStatoGioco() {
    localStorage.removeItem("statoGioco");
}

const stato = caricaStatoGioco();

if (stato && stato.inGioco) {
    inGioco = true;
    versione = stato.versione;
    numBombe = stato.numBombe;
    totalescommessa = stato.totalescommessa;
    cmoltiplicatore = stato.cmoltiplicatore;
    trovati = stato.trovati;
    bombe = stato.bombe;
    cliccata = stato.cliccata;

    // UI
    scommessa.value = totalescommessa;
    numBombeInput.value = numBombe;

    versioni.forEach(b => b.classList.remove("active"));
    document.getElementById(`Versione${versione}`)?.classList.add("active");

    aggiornaMaxBombe();
    aggiornaMoltiplicatore();

    // Rigenera griglia
    generacelle();

    // Ripristina celle già cliccate
    celle.forEach((cella, i) => {
        if (cliccata[i]) {
            cella.innerHTML = "";
            if (bombe.includes(i)) {
                cella.classList.add("bomb-reveal");
                cella.innerHTML = "💣";
            } else {
                cella.classList.add("diamond-reveal");
                cella.innerHTML = "💎";
            }
        }
    });
}