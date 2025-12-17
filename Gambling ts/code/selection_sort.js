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
    selectionSort(vettore1);
    stampaVettore(vettore1, "Primo Vettore Ordinato");
}

function sort2() {
    selectionSort(vettore2);
    stampaVettore(vettore2, "Secondo Vettore Ordinato");
}

function sortall() {
    let vettore3 = [...vettore1, ...vettore2];
    selectionSort(vettore3);
    stampaVettore(vettore3, "Vettore Totale Ordinato");
}

function selectionSort(arr) {
    for (let i = 0; i < arr.length - 1; i++) {
        let minIndex = i;

        for (let j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIndex]) {
                minIndex = j;
            }
        }

        if (minIndex !== i) {
            let temp = arr[i];
            arr[i] = arr[minIndex];
            arr[minIndex] = temp;
        }
    }

    return arr;
}


function pulisci() {
    textarea.value = "";

}