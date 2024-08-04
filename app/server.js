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
app.use(express.static("public"))


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

app.post("/api/category/add", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("name") ||
        body.name.length > 50 ||
        body.name.length < 1 
    ) {
        return res.sendStatus(400);
    }

    pool.query("INSERT INTO item_category(name) VALUES($1)", [body.name])
        .then(result => {
            res.sendStatus(200);
        })
        .catch(error => {
	        console.log(error);
            return res.sendStatus(500);
        })
});


app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
