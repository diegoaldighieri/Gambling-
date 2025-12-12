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

let totalescommessa = 0;
let cmoltiplicatore = 1;


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

// Caramelle iniziali
setCaramelle(500);


// ============================================================================
//  AGGIORNA MOLTIPLICATORE E VINCITA
// ============================================================================
function aggiornaMoltiplicatore() {
    document.getElementById("moltiplicatore").textContent = cmoltiplicatore.toFixed(2);
    document.getElementById("vincita").textContent = Math.floor(totalescommessa * cmoltiplicatore);
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
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

v1.addEventListener("click", () => versione = 1);
v2.addEventListener("click", () => versione = 2);
v3.addEventListener("click", () => versione = 3);


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

    if (n < 0) n = 0;

    if (n > getCaramelle()) {
        alert("NON HAI ABBASTANZA CARAMELLE");
        n = getCaramelle();
    }

    totalescommessa = n;
    scommessa.value = n;

    aggiornaMoltiplicatore();
}

scommessa.addEventListener("input", () => {
    const valore = parseInt(scommessa.value) || 0;
    setTotaleScommessa(valore);
});

function aggiungi(amount) {
    setTotaleScommessa(totalescommessa + amount);
}

somma5.addEventListener("click", () => aggiungi(5));
somma10.addEventListener("click", () => aggiungi(10));
somma50.addEventListener("click", () => aggiungi(50));
somma100.addEventListener("click", () => aggiungi(100));
maxbet.addEventListener("click", () => aggiungi(getCaramelle()));


// ============================================================================
//  GENERA CELLE
// ============================================================================
function generacelle() {

    // Reset totale
    celle.forEach(c => c.remove());
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;

    cmoltiplicatore = 1;
    aggiornaMoltiplicatore();

    const grid = document.getElementById("grid");

    // Numero celle in base alla versione
    const count =
        versione === 1 ? 9 :
            versione === 2 ? 16 :
                versione === 3 ? 25 : 0;

    if (count === 0) {
        alert("Scegli una versione pls");
        return;

    }


    // Set colonne griglia
    grid.style.gridTemplateColumns =
        versione === 1 ? "repeat(3, 1fr)" :
            versione === 2 ? "repeat(4, 1fr)" :
                "repeat(5, 1fr)";

    // Generate cells
    for (let i = 0; i < count; i++) {

        const cella = document.createElement("button");
        const img = document.createElement("img");

        img.src = "images/gray-square.png";
        img.classList.add("cella-img");

        cella.appendChild(img);
        cella.id = "cella_" + i;

        grid.appendChild(cella);

        celle.push(cella);
        cliccata.push(false);
    }

    // Posizione bomba
    const indiceBomba = Math.floor(Math.random() * celle.length);
    tesori = [indiceBomba];

    // Click sulle celle
    celle.forEach((cella, index) => {

        cella.addEventListener("click", () => {

            if (cliccata[index]) return;
            cliccata[index] = true;

            // BOMBA
            if (tesori.includes(index)) {

                cella.innerHTML = "💣";
                setCaramelle(getCaramelle() - totalescommessa);

                document.getElementById("overlay").style.display = "flex";
                return;
            }

            // SAFE
            cella.innerHTML = "💎";
            trovati++;

            cmoltiplicatore *= versionSettings[versione].safeBoost;
            aggiornaMoltiplicatore();

            // Vittoria totale
            if (trovati === celle.length - 1) {

                const bonus = versionSettings[versione].bonusFinale;
                const premio = Math.floor((totalescommessa * cmoltiplicatore) * bonus);

                setCaramelle(getCaramelle() + premio);
                document.getElementById("overlay2").style.display = "flex";
            }

        });

    });

}


// ============================================================================
//  START
// ============================================================================
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
    aggiornaMoltiplicatore();
}


// ============================================================================
//  ACCONTENTATI (CASHOUT)
// ============================================================================
accontentati.addEventListener("click", () => {
    const premio = Math.floor(totalescommessa * cmoltiplicatore);
    setCaramelle(getCaramelle() + premio - totalescommessa);

    document.getElementById("overlay3").style.display = "flex";
});