const textarea = document.getElementById("textarea");

function stampaVettore(vettore, titolo) {
    textarea.value += titolo + ":\n" + vettore.join(", ") + "\n\n";
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
    insertionSort(vettore1);
    stampaVettore(vettore1, "Primo Vettore Ordinato");
}

function sort2() {
    insertionSort(vettore2);
    stampaVettore(vettore2, "Secondo Vettore Ordinato");
}

function sortall() {
    let vettore3 = [...vettore1, ...vettore2];
    insertionSort(vettore3);
    stampaVettore(vettore3, "Vettore Totale Ordinato");
}

function insertionSort(arr) {
    for (let i = 0; i < arr.length; i++) {
        let T = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j] > T) {
            arr[j + 1] = arr[j];
            j--;
        }

        arr[j + 1] = T;
    }
}

function pulisci(){
    textarea.value="";

}
