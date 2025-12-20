// ============================================================================
//  VARIABILI ELEMENTI DOM
// ============================================================================
const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
const accontentati = document.getElementById("accontentati");

// ============================================================================
//  VARIABILI DI GIOCO
// ============================================================================
let versione = 0;
let celle = [];
let tesori = [];
let cliccata = [];
let trovati = 0;
let inGioco = false;

let totalescommessa = 0;
let cmoltiplicatore = 1;

// TEMA CORRENTE
let currentTheme = 'default';

// ============================================================================
//  FUNZIONI GESTIONE CARAMELLE
// ============================================================================
function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

function setCaramelle(n) {
    if (n < 0) n = 0;
    document.getElementById("caramelle").textContent = n;
}

setCaramelle(500);

// ============================================================================
//  AGGIORNA MOLTIPLICATORE E VINCITA
// ============================================================================
function aggiornaMoltiplicatore() {
    const moltiplicatoreEl = document.getElementById("moltiplicatore");
    const vincitaEl = document.getElementById("vincita");

    moltiplicatoreEl.textContent = cmoltiplicatore.toFixed(2);
    vincitaEl.textContent = Math.floor(totalescommessa * cmoltiplicatore);

    // Animazione pulse se il gioco è in corso
    if (inGioco && cmoltiplicatore > 1) {
        moltiplicatoreEl.parentElement.classList.add('pulse');
        vincitaEl.parentElement.classList.add('pulse');

        setTimeout(() => {
            moltiplicatoreEl.parentElement.classList.remove('pulse');
            vincitaEl.parentElement.classList.remove('pulse');
        }, 500);
    }
}

// ============================================================================
//  GESTIONE VERSIONI
// ============================================================================
const versioni = [v1, v2, v3];

const versionSettings = {
    1: {
        safeBoost: 1.03,
        bonusFinale: 1.10
    },
    2: {
        safeBoost: 1.04,
        bonusFinale: 1.25
    },
    3: {
        safeBoost: 1.06,
        bonusFinale: 1.50
    }
};

versioni.forEach(btn => {
    btn.addEventListener("click", () => {
        if (inGioco) {
            return;
        }

        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

v1.addEventListener("click", () => {
    if (!inGioco) versione = 1;
});

v2.addEventListener("click", () => {
    if (!inGioco) versione = 2;
});

v3.addEventListener("click", () => {
    if (!inGioco) versione = 3;
});

// ============================================================================
//  SCOMMESSA
// ============================================================================
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

    if (n > getCaramelle()) {
        n = getCaramelle();
    }

    totalescommessa = n;
    scommessa.value = n;

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
    if (inGioco) {
        return;
    }

    setTotaleScommessa(totalescommessa + amount);
}

somma5.addEventListener("click", () => aggiungi(5));
somma10.addEventListener("click", () => aggiungi(10));
somma50.addEventListener("click", () => aggiungi(50));
somma100.addEventListener("click", () => aggiungi(100));
maxbet.addEventListener("click", () => aggiungi(getCaramelle()));

// ============================================================================
//  OTTIENI IMMAGINE PER TEMA
// ============================================================================
function getThemeImage(theme) {
    const themeImages = {
        'default': 'images/gray-square.png',
        'dark': 'images/scuro-square.png',
        'neon': 'images/neon-square.png',
        'forest': 'images/forest-square.png',
        'sunset': 'images/tramonto-square.png',
        'ocean': 'images/oceano-square.png'
    };
    return themeImages[theme] || themeImages['default'];
}

// ============================================================================
//  GENERA CELLE
// ============================================================================
function generacelle() {
    if (totalescommessa <= 0) {
        return;
    }

    celle.forEach(c => c.remove());
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;

    cmoltiplicatore = 1;
    aggiornaMoltiplicatore();

    const grid = document.getElementById("grid");

    const count =
        versione === 1 ? 9 :
            versione === 2 ? 16 :
                versione === 3 ? 25 : 0;

    if (count === 0) {
        return;
    }

    inGioco = true;

    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

    for (let i = 0; i < count; i++) {
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

    const indiceBomba = Math.floor(Math.random() * celle.length);
    tesori = [indiceBomba];

    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => {
            if (cliccata[index]) return;
            cliccata[index] = true;

            // Aggiungi animazione di flip
            cella.classList.add('revealing');

            // Dopo l'animazione di flip, mostra il risultato
            setTimeout(() => {
                // Rimuovi l'immagine
                cella.innerHTML = "";

                if (tesori.includes(index)) {
                    // BOMBA! 💣
                    cella.classList.remove('revealing');
                    cella.classList.add('bomb-reveal');
                    cella.innerHTML = "💣";

                    // Shake della griglia
                    const gridWrapper = document.querySelector('.grid-wrapper');
                    gridWrapper.classList.add('shake');
                    setTimeout(() => gridWrapper.classList.remove('shake'), 500);

                    // Mostra overlay dopo l'animazione
                    setTimeout(() => {
                        setCaramelle(getCaramelle() - totalescommessa);
                        inGioco = false;
                        document.getElementById("overlay").style.display = "flex";
                    }, 600);

                    return;
                }

                // DIAMANTE! 💎
                cella.classList.remove('revealing');
                cella.classList.add('diamond-reveal');

                // Se hai trovato 3+ diamanti, aggiungi effetto combo
                if (trovati >= 2) {
                    cella.classList.add('combo-hit');
                }

                cella.innerHTML = "💎";
                trovati++;

                cmoltiplicatore *= versionSettings[versione].safeBoost;
                aggiornaMoltiplicatore();

                if (trovati === celle.length - 1) {
                    const bonus = versionSettings[versione].bonusFinale;
                    const premio = Math.floor((totalescommessa * cmoltiplicatore) * bonus);

                    setTimeout(() => {
                        setCaramelle(getCaramelle() + premio);
                        inGioco = false;
                        document.getElementById("overlay2").style.display = "flex";
                    }, 800);
                }
            }, 300); // Timing sincronizzato con l'animazione flip
        });
    });
}

start.addEventListener("click", generacelle);

// ============================================================================
//  CHIUDI POPUP
// ============================================================================
function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("overlay2").style.display = "none";
    document.getElementById("overlay3").style.display = "none";

    celle.forEach(c => c.remove());

    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;
    cmoltiplicatore = 1;
    inGioco = false;
    totalescommessa = 0;
    scommessa.value = 0;
    aggiornaMoltiplicatore();
}

// ============================================================================
//  ACCONTENTATI (CASHOUT)
// ============================================================================
accontentati.addEventListener("click", () => {
    if (!inGioco) {
        return;
    }

    const premio = Math.floor(totalescommessa * cmoltiplicatore);
    setCaramelle(getCaramelle() + premio - totalescommessa);

    inGioco = false;
    document.getElementById("overlay3").style.display = "flex";
});

// ============================================================================
//  THEME SWITCHER
// ============================================================================
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

    // Aggiorna le celle esistenti se il gioco è in corso
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

document.getElementById('theme-button').addEventListener('click', () => {
    document.getElementById('theme-menu').classList.toggle('hidden');
});

document.querySelectorAll('.theme-option').forEach(btn => {
    btn.addEventListener('click', () => {
        applyTheme(btn.dataset.theme);
        document.getElementById('theme-menu').classList.add('hidden');
    });
});

applyTheme('default');