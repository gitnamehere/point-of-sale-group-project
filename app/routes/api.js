const express = require("express");
const argon2 = require("argon2");
const apiRouter = express.Router();
const { Pool } = require("pg");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");

apiRouter.use(cookieParser());

// code adapted from the fly deployment demo

let databaseConfig;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
if (process.env.NODE_ENV == "production") {
    databaseConfig = { connectionString: process.env.DATABASE_URL };
} else {
    let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
    databaseConfig = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

// TODO: put database query into a seperate file
const pool = new Pool(databaseConfig);

// query and hashing code adapted from the password demo
// https://gitlab.cci.drexel.edu/nkl43/cs375_demos/-/blob/main/demo_password_cookies/dummy.js
pool.connect().then(async (client) => {
    // first time setup
    let accounts = await client
        .query("SELECT * FROM accounts")
        .then((results) => results.rows)
        .catch((error) => console.log(error));

    // if the POS has been newly set up (there are no accounts)
    if (accounts.length === 0) {
        const { BOSS_USER, BOSS_PASSWORD } = process.env;

        let hash = "";
        try {
            hash = await argon2.hash(BOSS_PASSWORD);

            await client
                .query(
                    "INSERT INTO accounts (username, password, first_name, last_name, account_type) VALUES ($1, $2, $3, $4, $5)",
                    [BOSS_USER, hash, "boss", "boss", "boss"],
                )
                .then(() => console.log("Boss account created!"))
                .catch((error) => console.log(error));
        } catch (error) {
            console.log(error);
            console.log("Error during POS setup.");
        }
    }

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

const authentication = (req, res, next) => {
    const { posAuth } = req.cookies;

    pool.query("SELECT * FROM tokens WHERE token = $1", [posAuth])
        .then((result) => {
            if (result.rows.length === 0) {
                // redirect to login page
                // https://expressjs.com/en/4x/api.html#res.redirect
                return res.redirect("/pos/login");
            }

            // not putting next() in here caused me an hour of pain
            next();
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });
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

// accounts and authtication

// this was pain
apiRouter.post("/auth/pos/login", async (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("username") ||
        !body.hasOwnProperty("password") ||
        body.username.length < 1 ||
        body.password.length < 1
    ) {
        return res.sendStatus(400);
    }

    //login process adapted from the demos
    //https://gitlab.cci.drexel.edu/nkl43/cs375_demos/-/blob/main/demo_password_cookies/app/server.js
    const result = await pool
        .query("SELECT * FROM accounts WHERE username = $1", [body.username])
        .then((result) => {
            if (result.rows.length === 0) return res.sendStatus(400);

            return result.rows[0];
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });

    const { id, password } = result;
    const verified = await argon2.verify(password, body.password);

    if (!verified) return res.sendStatus(400);

    const token = generateRandomToken();
    return pool
        .query("INSERT INTO tokens (token, user_id) VALUES ($1, $2)", [
            token,
            id,
        ])
        .then(() => {
            return res.cookie("posAuth", token, cookieOptions).sendStatus(200);
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });
});

apiRouter.get("/auth/pos/logout", (req, res) => {
    const { posAuth } = req.cookies;

    if (posAuth === undefined) return res.sendStatus(400);

    pool.query("DELETE FROM tokens WHERE token = $1", [posAuth])
        .then(() => {
            return res.redirect("/pos/login");
        })
        .catch((error) => {
            console.log(error);
            res.sendStatus(500);
        });
});

// TODO: update this to new schema
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

// item categories

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

// items

// request header to return all the items in the database, with optional query to return based on category
apiRouter.get("/items", (req, res) => {
    if (req.query.hasOwnProperty("category")) {
        return query(
            "SELECT * FROM item WHERE category = $1 AND is_deleted = false ORDER BY id ASC",
            [req.query.category],
            res,
        );
    }

    query("SELECT * FROM item AND is_deleted = false ORDER BY id ASC", [], res);
});

apiRouter.get("/items/:id", (req, res) => {
    query(
        "SELECT * FROM item WHERE id = $1 AND is_deleted = false",
        [req.params.id],
        res,
    );
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
        "UPDATE item SET name = $1, description = $2, price = $3 WHERE id = $4 AND is_deleted = false",
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

    query("UPDATE item SET is_deleted = true WHERE id = $1", [id], res, true);
});

// orders

// O(n) time complexity :)
// (there has to be a better way of doing this)
apiRouter.post("/orders/create", async (req, res) => {
    const body = req.body;

    if (!body.hasOwnProperty("order")) return res.sendStatus(400);

    const orderItems = Object.entries(body.order);

    // get the list of (non deleted) item ids from the db
    let validItems = [];
    // use await here otherwise items would be undefined
    await pool
        .query("SELECT id FROM item WHERE is_deleted = false")
        .then((result) => {
            // there has to be a better way of doing this
            for (let i = 0; i < result.rows.length; i++) {
                validItems.push(result.rows[i].id);
            }
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });

    // validation (I haven't tested this with bad data yet)
    for (let i = 0; i < orderItems.length; i++) {
        // parse and update orderItems for later use
        orderItems[i][0] = parseInt(orderItems[i][0]); // id
        orderItems[i][1] = parseInt(orderItems[i][1]); // quantity

        if (
            isNaN(orderItems[i][0]) ||
            isNaN(orderItems[i][1]) ||
            !validItems.includes(orderItems[i][0])
        )
            return res.sendStatus(400);
    }

    // create the order and the corresponding order_items;
    // conveniently, postgres has a CURRENT_DATE function
    //https://www.postgresql.org/docs/current/functions-datetime.html#FUNCTIONS-DATETIME-CURRENT
    pool.query(
        "INSERT INTO orders (items, subtotal, date_ordered) VALUES ($1, $2, CURRENT_DATE) RETURNING id",
        [JSON.stringify(body.order), body.subtotal],
    )
        .then((result) => {
            for (let i = 0; i < orderItems.length; i++) {
                const itemId = orderItems[i][0];
                const quantity = orderItems[i][1];
                const orderId = result.rows[0].id;

                pool.query(
                    "INSERT INTO order_item (item_id, quantity, order_id) VALUES ($1, $2, $3)",
                    [itemId, quantity, orderId],
                ).catch((error) => {
                    console.log(error);
                    return res.sendStatus(500);
                });
            }

            return res.sendStatus(200);
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });
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

apiRouter.get("/orders/items/:id", (req, res) => {
    const id = req.params.id;
    if (!id) {
        return res.sendStatus(400);
    }

    query("SELECT * FROM order_item WHERE order_id = $1", [id], res);
});

apiRouter.get("/discounts/:code", (req, res) => {
    const code = req.params.code;
    if (!code) {
        return res.sendStatus(400);
    }

    query("SELECT discount FROM discounts WHERE code = $1", [code], res);
});

apiRouter.put("/orders/process/:id", (req, res) => {
    const id = req.params.id;
    const { discountAmount, tipAmount, total } = req.body;

    query(
        "UPDATE orders SET discount = $1, tips = $2, total = $3, is_paid = true WHERE id = $4",
        [discountAmount, tipAmount, total, id],
        res,
        true,
    );
});

module.exports = { apiRouter, authentication };
