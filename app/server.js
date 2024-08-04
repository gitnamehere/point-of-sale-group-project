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

// POST API endpoint to add items in the database
app.post("/api/item/add", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("category") ||
        !body.hasOwnProperty("name") ||
        !body.hasOwnProperty("description") ||
        !body.hasOwnProperty("price") ||
        body.name.length > 50 ||
        body.name.length < 1 
    ) {
        return res.sendStatus(400);
    }

    const {category, name, description, price} = body;

    pool.query("INSERT INTO item(category, name, description, price) VALUES($1, $2, $3, $4)", [category, name, description, price])
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
