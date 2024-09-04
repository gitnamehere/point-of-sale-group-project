const express = require("express");
const argon2 = require("argon2");
const apiRouter = express.Router();
const { Pool } = require("pg");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const Papa = require("papaparse");

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
            if (result.rows.length === 0) return res.sendStatus(401);

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

// POST API endpoint to add items to cart_item
apiRouter.post("/cart/add", (req, res) => {
    const body = req.body;

    if (!body.hasOwnProperty("item_id") || !body.hasOwnProperty("quantity")) {
        return res.sendStatus(400);
    }

    const { item_id, quantity } = body;

    query(
        "INSERT INTO cart_item (item_id, quantity) VALUES ($1, $2)",
        [item_id, quantity],
        res,
        true,
    );
});

// GET API endpoint to retrieve all items in the cart
apiRouter.get("/cart/items", (req, res) => {
    query("SELECT * FROM cart_item ORDER BY id ASC", [], res);
});

// PUT API endpoint to update the quantity of the item
apiRouter.put("/cart/update/:id", (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if (!body.hasOwnProperty("quantity")) {
        return res.sendStatus(400);
    }

    const { quantity } = body;

    query(
        "UPDATE cart_item SET quantity = $1 WHERE item_id = $2",
        [quantity, id],
        res,
        true,
    );
});

// DELETE API endpoint to remove item from cart
apiRouter.delete("/cart/delete/:id", (req, res) => {
    const id = req.params.id;

    query("DELETE FROM cart_item WHERE item_id = $1", [id], res, true);
});

apiRouter.get("/business-information", (req, res) => {
    query("SELECT * FROM business_information", [], res);
});

apiRouter.get("/themes", (req, res) => {
    query("SELECT * FROM themes", [], res);
});

// routes after here needs api authentication
apiRouter.use(authentication);

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

apiRouter.post("/auth/store/account/create", async (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("firstname") ||
        !body.hasOwnProperty("lastname") ||
        !body.hasOwnProperty("phone") ||
        !body.hasOwnProperty("email") ||
        body.firstname.length > 50 ||
        body.firstname.length < 1 ||
        body.lastname.length > 50 ||
        body.lastname.length < 1 ||
        body.phone.length < 1 ||
        body.phone.length > 12 ||
        body.email.length < 1
    ) {
        return res.sendStatus(400);
    }

    let emails = [];
    await pool
        .query("SELECT email FROM customer")
        .then((result) => {
            for (let i = 0; i < result.rows.length; i++) {
                emails.push(result.rows[i].email);
            }
        })
        .catch((error) => {
            console.log(error);
            return res.sendStatus(500);
        });

    const { firstname, lastname, phone, email } = req.body;

    if (emails.includes(email)) {
        res.statusMessage = "Email Already Exists";
        return res.sendStatus(500);
    }

    query(
        "INSERT INTO customer(first_name, last_name, phone_number, email) VALUES($1, $2, $3, $4)",
        [firstname, lastname, phone, email],
        res,
        true,
    );
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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

apiRouter.post("/item/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    const csvData = req.file.buffer.toString("utf-8");

    Papa.parse(csvData, {
        header: true,
        complete: async (results) => {
            let categories = {};
            await pool
                .query("SELECT * FROM item_category")
                .then((result) => {
                    for (let i = 0; i < result.rows.length; i++) {
                        const { id, name } = result.rows[i];
                        categories[name] = id;
                    }
                })
                .catch((error) => {
                    console.log(error);
                    return res.sendStatus(500);
                });

            for (let i = 0; i < results.data.length; i++) {
                if (
                    !results.data[i].hasOwnProperty("category") ||
                    !results.data[i].hasOwnProperty("name") ||
                    !results.data[i].hasOwnProperty("description") ||
                    !results.data[i].hasOwnProperty("price") ||
                    results.data[i].name.length > 50 ||
                    results.data[i].name.length < 1
                ) {
                    // if there is an invalid item data, skip it
                    continue;
                }

                const { category, name, description, price } = results.data[i];

                // add the category if it doesn't already exist
                if (!categories.hasOwnProperty(category)) {
                    await pool
                        .query(
                            "INSERT INTO item_category (name) VALUES ($1) RETURNING id",
                            [category],
                        )
                        .then((result) => {
                            categories[category] = result.rows[0].id;
                        })
                        .catch((error) => {
                            console.log(error);
                            return res.sendStatus(500);
                        });
                }

                await pool
                    .query(
                        "INSERT INTO item(category, name, description, price) VALUES($1, $2, $3, $4)",
                        [categories[category], name, description, price],
                    )
                    .catch((error) => {
                        console.log(error);
                        return res.sendStatus(500);
                    });
            }

            res.sendStatus(200);
        },
        error: (error) => {
            res.status(500).json({ error: "Error parsing CSV file." });
            console.error("Error parsing CSV file:", error);
        },
    });
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

const orderFilters = ["paid", "unpaid", "void"];

apiRouter.get("/orders", (req, res) => {
    if (
        !req.query.hasOwnProperty("filter") ||
        !orderFilters.includes(req.query.filter)
    )
        return query("SELECT * FROM orders ORDER BY id ASC", [], res);

    switch (req.query.filter) {
        case "paid":
            return query(
                "SELECT * FROM orders WHERE is_paid = true AND is_void = false ORDER BY id ASC",
                [],
                res,
            );
        case "unpaid":
            return query(
                "SELECT * FROM orders WHERE is_paid = false AND is_void = false ORDER BY id ASC",
                [],
                res,
            );
        case "void":
            return query(
                "SELECT * FROM orders WHERE is_void = true ORDER BY id ASC",
                [],
                res,
            );
        default:
            return query("SELECT * FROM orders ORDER BY id ASC", [], res);
    }
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

apiRouter.put("/orders/void/:id", (req, res) => {
    const id = req.params.id;

    query(
        "UPDATE orders SET is_void = true WHERE id = $1 AND is_paid = false",
        [id],
        res,
        true,
    );
});

apiRouter.put("/orders/refund/:id", (req, res) => {
    const id = req.params.id;

    query(
        "UPDATE orders SET is_paid = false WHERE id = $1 AND is_paid = true",
        [id],
        res,
        true,
    );
});

apiRouter.put("/business-information", (req, res) => {
    const body = req.body;

    // honestly we should write a function for this
    if (
        !body.hasOwnProperty("name") ||
        !body.hasOwnProperty("description") ||
        !body.hasOwnProperty("address_one") ||
        !body.hasOwnProperty("address_two") ||
        !body.hasOwnProperty("phone") ||
        !body.hasOwnProperty("email") ||
        body.name.length < 1 ||
        body.description.length < 1 ||
        body.phone.length > 12 ||
        body.phone.length < 1 ||
        body.address_one.length < 1 ||
        body.address_two.length < 1 ||
        body.email.length < 1
    ) {
        return res.sendStatus(400);
    }

    const { name, description, address_one, address_two, phone, email } = body;

    query(
        "UPDATE business_information SET business_name = $1, description = $2, address_one = $3, address_two = $4, phone_number = $5, email = $6 WHERE id = 1",
        [name, description, address_one, address_two, phone, email],
        res,
        true,
    );
});

apiRouter.put("/themes", (req, res) => {
    const body = req.body;

    if (
        !body.hasOwnProperty("background_color") ||
        !body.hasOwnProperty("primary_color") ||
        !body.hasOwnProperty("secondary_color") ||
        body.background_color.length < 1 ||
        body.primary_color.length < 1 ||
        body.secondary_color.length < 1
    ) {
        return res.sendStatus(400);
    }

    const { background_color, primary_color, secondary_color } = body;

    query(
        "UPDATE themes SET background_color = $1, primary_color = $2, secondary_color = $3 WHERE id = 1",
        [background_color, primary_color, secondary_color],
        res,
        true,
    );
});

module.exports = { apiRouter, pool };
