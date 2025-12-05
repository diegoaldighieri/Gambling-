const textarea = document.getElementById("textarea");

function stampaVettore(vettore, titolo) {
    textarea.value = titolo + ":\n" + vettore.join(", ") + "\n";
}

function generazione1() {
    vettore1 = [];
    for (let i = 0; i < 20; i++) {
        vettore1.push(Math.floor(Math.random() * 100));
    }
    stampaVettore(vettore1, "Primo Vettore");
}

function generazione2() {
    vettore2 = [];
    for (let i = 0; i < 20; i++) {
        vettore2.push(Math.floor(Math.random() * 100));
    }
    stampaVettore(vettore2, "Secondo Vettore");
}

function sort1() {
    bubbleSort(vettore1);
    stampaVettore(vettore1, "Primo Vettore Ordinato");
}

function sort2() {
    bubbleSort(vettore2);
    stampaVettore(vettore2, "Secondo Vettore Ordinato");
}

function sortall() {
    let vettore3 = [...vettore1, ...vettore2];
    bubbleSort(vettore3);
    stampaVettore(vettore3, "Vettore Totale Ordinato");
}

function bubbleSort(arr) {
    let scambio = true;
    while (scambio) {
        scambio = false;
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i+1]) {
                [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; // swap più elegante
                scambio = true;
            }
        }
    }
}
