const express = require("express");
const posRouter = express.Router();
const cookieParser = require("cookie-parser");
const { pool } = require("./api.js");

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

posRouter.use(express.static("frontend/public/pos"));
posRouter.use(cookieParser()); // we need this here otherwise authentication wont work
posRouter.use(authentication);
posRouter.use(express.static("frontend/private/pos"));

module.exports = { posRouter };
