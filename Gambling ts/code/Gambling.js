const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
const accontentati = document.getElementById("accontentati");

let versione = 0;
let celle = [];
let tesori = [];
let cliccata = [];
let trovati = 0;

let totalescommessa = 0;
let cmoltiplicatore = 1;

// ------------------------------
//  FUNZIONI CARAMELLE
// ------------------------------
function getCaramelle() {
    return parseInt(document.getElementById("caramelle").textContent) || 0;
}

function setCaramelle(n) {
    if (n < 0) n = 0;
    document.getElementById("caramelle").textContent = n;
}

setCaramelle(500);

// ------------------------------
//  AGGIORNA MOLTIPLICATORE + VINCITA
// ------------------------------
function aggiornaMoltiplicatore() {
    document.getElementById("moltiplicatore").textContent = cmoltiplicatore.toFixed(2);
    document.getElementById("vincita").textContent = Math.floor(totalescommessa * cmoltiplicatore);
}

// ------------------------------
const versioni = [v1, v2, v3];

versioni.forEach(btn => {
    btn.addEventListener("click", () => {
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});

v1.addEventListener("click", () => versione = 1);
v2.addEventListener("click", () => versione = 2);
v3.addEventListener("click", () => versione = 3);

// ------------------------------
//   UPDATE SCOMMESSA
// ------------------------------
const somma5 = document.getElementById("somma5");
const somma10 = document.getElementById("somma10");
const somma50 = document.getElementById("somma50");
const somma100 = document.getElementById("somma100");
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
    let v = parseInt(scommessa.value) || 0;
    setTotaleScommessa(v);
});

function aggiungi(amount) {
    setTotaleScommessa(totalescommessa + amount);
}

somma5.addEventListener("click", () => aggiungi(5));
somma10.addEventListener("click", () => aggiungi(10));
somma50.addEventListener("click", () => aggiungi(50));
somma100.addEventListener("click", () => aggiungi(100));

// ------------------------------
//   GENERA CELLE
// ------------------------------
function generacelle() {

    // reset
    for (let i = 0; i < celle.length; i++) celle[i].remove();
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;

    cmoltiplicatore = 1; // reset moltiplicatore
    aggiornaMoltiplicatore();

    const grid = document.getElementById("grid");

    let count = versione === 1 ? 9 : versione === 2 ? 16 : versione === 3 ? 25 : 0;
    if (count === 0) {
        alert("Scegli una versione pls");
        return;
    }

    if (versione === 1) grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    if (versione === 2) grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    if (versione === 3) grid.style.gridTemplateColumns = "repeat(5, 1fr)";

    for (let i = 0; i < count; i++) {
        let c = document.createElement("button");
        let img = document.createElement("img");
        img.src = "images/gray-square.png";
        img.classList.add("cella-img");
        c.appendChild(img);

        c.id = "cella_" + i;
        grid.appendChild(c);
        celle.push(c);
        cliccata.push(false);
    }

    let t = Math.floor(Math.random() * celle.length);
    tesori = [t];

    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => {
            if (cliccata[index]) return;
            cliccata[index] = true;

            if (tesori.includes(index)) {
                cella.innerHTML = "💣";
                setCaramelle(getCaramelle() - totalescommessa);
                document.getElementById("overlay").style.display = "flex";
            } else {
                cella.innerHTML = "💎";
                trovati++;
                cmoltiplicatore *= 1.10;
                aggiornaMoltiplicatore();

                if (trovati === celle.length - 1) {
                    setCaramelle(getCaramelle() + totalescommessa-totalescommessa);
                    document.getElementById("overlay2").style.display = "flex";
                }
            }
        });
    });
}

start.addEventListener("click", () => generacelle());

function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("overlay2").style.display = "none";
    document.getElementById("overlay3").style.display = "none";

    for (let i = 0; i < celle.length; i++) celle[i].remove();
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;

    aggiornaMoltiplicatore();
}
// fuori dal ciclo celle
accontentati.addEventListener("click", function () {
    setCaramelle(getCaramelle() + Math.floor(totalescommessa * cmoltiplicatore)-totalescommessa);
    document.getElementById("overlay3").style.display = "flex";
});

