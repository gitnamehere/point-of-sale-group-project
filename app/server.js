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

// request header to return all the items in the database, with optional query to return based on category
app.get("/api/items", (req, res) => {
    if (req.query.hasOwnProperty("category")) {
        return pool.query("SELECT * FROM item WHERE category = $1", [req.query.category])
        .then(result => {
            res.json(result.rows);
        })
        .catch(error => {
            console.log(error);
            res.sendStatus(500);
        })
    }

    pool.query("SELECT * FROM item")
    .then(result => {
        res.json(result.rows);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    })
});

app.get("/api/items/:id", (req, res) => {
    pool.query("SELECT * FROM item WHERE id = $1", [req.params.id])
    .then(result => {
        res.json(result.rows);
    })
    .catch(error => {
        console.log(error);
        res.sendStatus(500);
    })
});

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
