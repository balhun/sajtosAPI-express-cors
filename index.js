import express from "express";
import cors from "cors";
import fs from "fs";

let sajtok = [];
let azon = 1;

fs.readFile("sajtok.csv", "utf-8", (err, data) => {
    if (err) console.log(err);
    else {
        let sorok = data.split("\r\n");
        for (let sor of sorok) {
            let s = sor.split(";");
            sajtok.push({ id:azon, nev:s[0], suly:s[1]*1, ar:s[2]*1 });
            azon++;
        }
    }
});

function save(req, res) {
    let adat = sajtok.map(x => x.nev + ";" + x.suly + ";" + x.ar).join("\r\n");
    fs.writeFile("sajtok.csv", adat, "utf-8", (err) => {
        if (err) {
            console.log(err);
            res.send({ error: "Sikertelen mentés" });
        } else {
            res.send({ status: "OK" });
        }
    })
}

function saveSajt(req, res) {
    if (req.body.nev && req.body.suly && req.body.ar) {
        sajtok.push({ id:azon, nev:req.body.nev, suly:req.body.suly*1, ar:req.body.ar*1 });
        azon++;
        res.send({ status: "OK" });
    } else res.send({ error: "Hiányos adattag!" });
}

function deleteSajt(req, res) {
    if (req.body.id) {
        let i = indexOf(req.body.id);
        if (i == -1) res.send({ error:"Nem létező ID" });
        else {
            sajtok.splice(i, 1);
            res.send({ status : "OK" });
        }
    } else res.send({ error: "Hibás paraméter!" });
}

function modSajt(req, res) {
    if (req.body.id && req.body.nev && req.body.suly && req.body.ar) {
        let i = indexOf(req.body.id);
        if (i == -1) res.send({ error:"Nem létező ID" });
        else {
            sajtok[i] = { id:azon, nev:req.body.nev, suly:req.body.suly*1, ar:req.body.ar*1 };
            res.send({ status: "OK" });
        }
    } else res.send({ error: "Hibás paraméterek!" });
}

function modAr(req, res) {
    if (req.body.id && req.body.ar) {
        let i = indexOf(req.body.id);
        if (i == -1) res.send({ error:"Nem létező ID" });
        else {
            sajtok[i].ar = req.body.ar*1;
            res.send({ status: "OK" });
        }
    } else res.send({ error: "Hibás paraméterek!" });
}

function indexOf(id) {
    let i = 0;
    while (i < sajtok.length && sajtok[i].id != id) i++;
    if (i < sajtok.length) return i; else return-1
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.send("<h1>Sajtok v1.0.0</h1>"));
app.get("/sajtok", (req, res) => res.send(sajtok));
app.get("/ar", (req, res) => res.send(sajtok.toSorted((a, b) => b.ar - a.ar)));
app.get("/save", save);
app.post("/sajt", saveSajt);
app.delete("/sajt", deleteSajt);
app.put("/sajt", modSajt);
app.patch("/ar", modAr);

app.listen(88, e => { 
    if (e) console.log(e);
    else console.log("Server running on port 88");
});