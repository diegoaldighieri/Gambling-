const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
let versione= 0;
let celle= [];
let tesori = [];
let cliccata = [];
let trovati = 0;
let errori = 0;

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



function generacelle(){
    for (let i = 0; i < celle.length; i++) {
        celle[i].remove();
    }
    celle = [];
    tesori = [];
    cliccata = [];
    trovati = 0;
    errori = 0;

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
}

start.addEventListener("click", () => {
    generacelle();
})
