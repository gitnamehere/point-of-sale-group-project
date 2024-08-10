const express = require("express");
const { Pool } = require("pg");
const env = require("../env.json");
const crypto = require("crypto");

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
const tokenStorage = {};

const authentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token || !tokenStorage[token]) {
        return res.status(401).json({ error: "Token required."});
    }
    next();
};

const generateRandomToken = () => {
    return crypto.randomBytes(32).toString("hex");
}

app.get("/api/auth/demoKey", (req, res) => {
    const token = generateRandomToken();
    tokenStorage[token] = true;
    console.log(tokenStorage); //keep track of tokens created
    return res.json({ token });
})

app.get("/pos/", authentication, (req, res) => {
    return res.status(200).json({ message: "Token valid"});
});

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
