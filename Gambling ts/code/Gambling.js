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

// Gestione saldo
function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

function setCaramelle(n) {
    if (n < 0) n = 0;
    document.getElementById("caramelle").textContent = n;
    salvaCaramelle(n);
}

// Inizializza caramelle dal localStorage
setCaramelle(caricaCaramelle());

// Moltiplicatore - Tabelle predefinite
const moltiplicatoriTabelle = {
    // 3x3 (9 celle)
    "9_1": [1.13, 1.29, 1.48, 1.71, 2.00, 2.35, 2.79, 3.35],
    "9_2": [1.29, 1.71, 2.35, 3.35, 5.00, 8.00, 13.00],
    "9_3": [1.48, 2.35, 4.07, 8.00, 16.00, 35.00],
    "9_4": [1.71, 3.35, 8.00, 20.00, 55.00],
    "9_5": [2.00, 5.00, 16.00, 55.00],
    "9_6": [2.35, 8.00, 35.00],

    // 4x4 (16 celle)
    "16_1": [1.07, 1.14, 1.22, 1.31, 1.41, 1.52, 1.64, 1.77, 1.92, 2.09, 2.28, 2.50, 2.75, 3.04, 3.38],
    "16_2": [1.14, 1.31, 1.52, 1.77, 2.09, 2.50, 3.04, 3.75, 4.69, 6.00, 7.88, 10.71, 15.00],
    "16_3": [1.22, 1.52, 1.92, 2.50, 3.38, 4.69, 6.79, 10.38, 16.88, 29.25, 56.25, 128.00],
    "16_4": [1.31, 1.77, 2.50, 3.75, 6.00, 10.38, 19.69, 41.25, 100.00, 300.00],
    "16_5": [1.41, 2.09, 3.38, 6.00, 12.00, 27.56, 73.13, 243.75],
    "16_6": [1.52, 2.50, 4.69, 10.38, 27.56, 90.00, 393.75],
    "16_7": [1.64, 3.04, 6.79, 19.69, 73.13, 393.75],
    "16_8": [1.77, 3.75, 10.38, 41.25, 243.75],
    "16_9": [1.92, 4.69, 16.88, 100.00],
    "16_10": [2.09, 6.00, 29.25, 300.00],
    "16_11": [2.28, 7.88, 56.25],
    "16_12": [2.50, 10.71, 128.00],

    // 5x5 (25 celle)
    "25_1": [1.04, 1.09, 1.13, 1.18, 1.23, 1.28, 1.34, 1.40, 1.46, 1.53, 1.60, 1.68, 1.76, 1.85, 1.95, 2.05, 2.17, 2.29, 2.43, 2.58, 2.75, 2.93, 3.14, 3.38],
    "25_2": [1.09, 1.18, 1.28, 1.40, 1.53, 1.68, 1.85, 2.05, 2.29, 2.58, 2.93, 3.38, 3.95, 4.69, 5.66, 6.97, 8.79, 11.44, 15.52, 22.13, 34.38, 59.69],
    "25_3": [1.13, 1.29, 1.48, 1.71, 2.00, 2.35, 2.79, 3.35, 4.07, 5.00, 6.21, 7.83, 10.04, 13.13, 17.61, 24.38, 35.15, 53.44, 87.19, 156.25, 328.13],
    "25_4": [1.18, 1.40, 1.68, 2.05, 2.58, 3.38, 4.69, 6.97, 11.44, 22.13, 53.44, 156.25, 656.25],
    "25_5": [1.23, 1.53, 1.95, 2.58, 3.56, 5.16, 8.00, 13.40, 24.38, 50.00, 117.19, 328.13, 1093.75],
    "25_10": [1.60, 2.93, 6.21, 15.63, 46.88, 171.88, 843.75, 6000.00],
    "25_15": [2.17, 6.97, 34.38, 328.13, 10000.00],
    "25_20": [3.38, 22.13, 656.25, 100000.00],
};

function getMoltiplicatorePerDiamanti(diamantiTrovati) {
    if (diamantiTrovati === 0) return 1.00;

    const totaleCelle = getTotaleCelle();
    const key = `${totaleCelle}_${numBombe}`;

    const tabella = moltiplicatoriTabelle[key];

    if (!tabella) {
        // Fallback al calcolo base se non c'è tabella
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
                        inGioco = false;
                        document.getElementById("overlay2").style.display = "flex";
                    }, 1200);
                }
            }, 300);
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