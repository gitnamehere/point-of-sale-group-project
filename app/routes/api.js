const express = require("express");
const apiRouter = express.Router();
const { Pool } = require("pg");
const env = require("../../env.json");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

apiRouter.use(cookieParser());

// TODO: put database query into a seperate file
const pool = new Pool(env);
pool.connect().then(() => {
    console.log("Connected to database");
});

// standard pool.query so we don't need to write pool.query().then().catch() for every single database query
function query(query, values, res, sendStatus = false) {
    pool.query(query, values)
        .then((result) => {
            if (sendStatus) return res.sendStatus(200);

            return res.json(result.rows);
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });
}

// TODO: put auth functions and other stuff into a seperate file
const tokenStorage = {};
const authentication = (req, res, next) => {
    const { posAuth } = req.cookies;

    if (!tokenStorage.hasOwnProperty(posAuth) || !tokenStorage[posAuth])
        return res.sendStatus(401);

    next();
};

const generateRandomToken = () => {
    return crypto.randomBytes(32).toString("hex");
};

// cookieOptions from the demo
const cookieOptions = {
    httpOnly: true, // JS can't access it
    secure: true, // only sent over HTTPS connections
    sameSite: "strict", // only sent to this domain
};

apiRouter.get("/auth/pos", (req, res) => {
    const { posAuth } = req.cookies;

    if (posAuth === undefined || tokenStorage[posAuth] === undefined) {
        const token = generateRandomToken();
        tokenStorage[token] = true;
        console.log(tokenStorage); //keep track of tokens created
        return res.cookie("posAuth", token, cookieOptions).sendStatus(200);
    }

    return res.send("Already Authenticated");
});

apiRouter.get("/auth/pos/test", authentication, (req, res) => {
    res.sendStatus(200);
});

// request header to return all the items in the database, with optional query to return based on category
apiRouter.get("/items", (req, res) => {
    if (req.query.hasOwnProperty("category")) {
        return query(
            "SELECT * FROM item WHERE category = $1 ORDER BY id ASC",
            [req.query.category],
            res,
        );
    }

    query("SELECT * FROM item ORDER BY id ASC", [], res);
});

apiRouter.get("/items/:id", (req, res) => {
    query("SELECT * FROM item WHERE id = $1", [req.params.id], res);
});

// demo api endpoint that may be removed later
apiRouter.get("/item/categories", (req, res) => {
    query("SELECT * FROM item_category", [], res);
});

// POST API endpoint to add items in the database
apiRouter.post("/item/add", (req, res) => {
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

    const { category, name, description, price } = body;

    query(
        "INSERT INTO item(category, name, description, price) VALUES($1, $2, $3, $4)",
        [category, name, description, price],
        res,
        true,
    );
});

apiRouter.post("/category/add", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("name") ||
        body.name.length > 50 ||
        body.name.length < 1
    ) {
        return res.sendStatus(400);
    }

    query("INSERT INTO item_category(name) VALUES($1)", [body.name], res, true);
});

apiRouter.post("/accounts/add", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("username") ||
        !body.hasOwnProperty("firstname") ||
        !body.hasOwnProperty("lastname") ||
        !body.hasOwnProperty("accountType") ||
        body.username.length > 50 ||
        body.username.length < 1 ||
        body.firstname.length > 50 ||
        body.firstname.length < 1 ||
        body.lastname.length > 50 ||
        body.lastname.length < 1 ||
        body.accountType.length > 50 ||
        body.accountType.length < 1
    ) {
        return res.sendStatus(400);
    }

    const { username, firstname, lastname, accountType } = req.body;

    query(
        "INSERT INTO account(username, first_name, last_name, account_type) VALUES($1, $2, $3, $4)",
        [username, firstname, lastname, accountType],
        res,
        true,
    );
});

// PUT API endpoint to update exisiting item
apiRouter.put("/items/:id", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("name") ||
        !body.hasOwnProperty("description") ||
        !body.hasOwnProperty("price") ||
        body.name.length > 50 ||
        body.name.length < 1
    ) {
        return res.sendStatus(400);
    }

    const { name, description, price } = req.body;
    const id = req.params.id;

    query(
        "UPDATE item SET name = $1, description = $2, price = $3 WHERE id = $4",
        [name, description, price, id],
        res,
        true,
    );
});

// DELETE API endpoint to delete exisiting item
apiRouter.delete("/items/:id", (req, res) => {
    const params = req.params;

    if (!params.hasOwnProperty("id")) {
        return res.sendStatus(400);
    }

    const id = params.id;

    query("DELETE FROM item WHERE id = $1", [id], res);
});

apiRouter.post("/orders/create", (req, res) => {
    const body = req.body;

    if (!body.hasOwnProperty("order")) return res.sendStatus(400);
    // TODO: add validation
    query(
        "INSERT INTO orders (items, subtotal) VALUES ($1, $2)",
        [JSON.stringify(body.order), body.subtotal],
        res,
        true,
    );
});

apiRouter.get("/orders", (req, res) => {
    query("SELECT * FROM orders", [], res);
});

apiRouter.get("/orders/:id", (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.sendStatus(400);
    }

    query("SELECT * FROM orders WHERE id = $1", [id], res);
});

module.exports = { apiRouter, authentication };
