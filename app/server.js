const express = require("express");
const { Pool } = require("pg");
const env = require("../env.json");

const app = express();
const hostname = "localhost";
const port = 3000;

const pool = new Pool(env);
pool.connect().then(() => {
    console.log("Connected to database");
});

app.use(express.json());

// TODO: everything

// demo api endpoint that may be removed later
app.get("/api/item/categories", (req, res) => {
    pool.query("SELECT * FROM item_category")
    .then(result => {
        res.json(result.rows);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    })
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
