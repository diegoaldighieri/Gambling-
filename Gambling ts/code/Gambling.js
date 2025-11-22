const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
let versione= 0;
let celle= [];
let tesori = [];
let cliccata = [];
let trovati = 0;
const somma5 = document.getElementById("somma5");
const somma10 = document.getElementById("somma10");
const somma50 = document.getElementById("somma50");
const somma100 = document.getElementById("somma100");
const scommessa = document.getElementById("scommessa");
let totalescommessa=0;

document.getElementById("caramelle").innerHTML+=" 500";

const versioni = [document.getElementById("Versione1"),
    document.getElementById("Versione2"),
    document.getElementById("Versione3")];

versioni.forEach(btn => {
    btn.addEventListener("click", () => {
        versioni.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
    });
});


v1.addEventListener("click", () => {
    versione=1;
})
v2.addEventListener("click", () => {
    versione=2;
})
v3.addEventListener("click", () => {
    versione=3;
})

somma5.addEventListener("click", () => {
    totalescommessa+=5;
    scommessa.value=totalescommessa;

})
somma10.addEventListener("click", () => {
    totalescommessa+=10;
    scommessa.value=totalescommessa;

})
somma50.addEventListener("click", () => {
    totalescommessa+=50;
    scommessa.value=totalescommessa;

})
somma100.addEventListener("click", () => {
    totalescommessa+=100;
    scommessa.value=totalescommessa;
})




function generacelle(){
    for (let i = 0; i < celle.length; i++) {
        celle[i].remove();
    }
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;

    if(versione === 1){
        for(let i=0; i<9;i++) {
            let c = document.createElement("button");
            document.getElementById("grid").appendChild(c);
            c.innerHTML = "";
            let img = document.createElement("img");
            img.src = "images/gray-square.png";
            img.classList.add("cella-img");
            c.appendChild(img);
            c.id = "cella_" + i;
            celle.push(c);
            cliccata.push(false);

        }
    }
    else if(versione === 2){
        for(let i=0; i<16;i++){
            let c = document.createElement("button");
            document.getElementById("grid").appendChild(c);
            c.innerHTML = "";
            let img = document.createElement("img");
            img.src = "images/gray-square.png";
            img.classList.add("cella-img");
            c.appendChild(img);

            c.id = "cella_" + i;
            celle.push(c);
            cliccata.push(false);

        }

    }
    else if (versione === 3){
        for(let i=0; i<25;i++){
            let c = document.createElement("button");
            document.getElementById("grid").appendChild(c);
            c.innerHTML = "";
            let img = document.createElement("img");
            img.src = "images/gray-square.png";
            img.classList.add("cella-img");
            c.appendChild(img);
            c.id = "cella_" + i;
            celle.push(c);
            cliccata.push(false);

        }
    }
    else {
        return -1;
    }


    const grid = document.getElementById("grid");

    if (versione === 1) grid.style.gridTemplateColumns = "repeat(3, 1fr)";
    if (versione === 2) grid.style.gridTemplateColumns = "repeat(4, 1fr)";
    if (versione === 3) grid.style.gridTemplateColumns = "repeat(5, 1fr)";
    let t = Math.floor(Math.random() * celle.length);
    tesori = [t];
    celle.forEach((cella, index) => {
        cella.addEventListener("click", () => {

            if (cliccata[index]) return;
            cliccata[index] = true;

            if (tesori.includes(index)) {
                cella.innerHTML="💣"

                document.getElementById("overlay").style.display = "flex";

            } else {
                cella.innerHTML="💎"
                trovati++;
            }

        });
    });

}

start.addEventListener("click", () => {
    generacelle();
})

function closePopup(){
    document.getElementById("overlay").style.display = "none";
    for (let i = 0; i < celle.length; i++) {
        celle[i].remove();
    }
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;
}
