const v1 = document.getElementById("Versione1");
const v2 = document.getElementById("Versione2");
const v3 = document.getElementById("Versione3");
const start = document.getElementById("start");
let versione= 0;
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
    if(versione === 1){
        for(let i=0; i<10;i++) {
            let c = document.createElement("button");
            document.body.appendChild(c);
            c.innerText = "?";
            c.id = "cella_" + i;
        }
    }
    else if(versione === 2){
        for(let i=0; i<7;i++){
            let c = document.createElement("button");
            document.body.appendChild(c);
            c.innerText = "?";
            c.id = "cella_" + i;
        }

    }
    else if (versione === 3){
        for(let i=0; i<20;i++){
            let c = document.createElement("button");
            document.body.appendChild(c);
            c.innerText = "?";
            c.id = "cella_" + i;
        }
    }
    else {
        return -1;
    }
}

start.addEventListener("click", () => {
    generacelle();
})