const express = require("express");
const posRouter = express.Router();
const cookieParser = require("cookie-parser");
const { authentication } = require("./api.js");

// apparently setting the absolute path (probably because of node server.js) works
// TODO: have mac user test this
const rootPath = "./";

posRouter.use(cookieParser()); // we need this here otherwise authentication wont work
posRouter.use(authentication);

posRouter.get("/ordering", (req, res) => {
    res.sendFile("/public/pos/ordering/index.html", { root: rootPath });
});

posRouter.get("/ordering/styles.css", (req, res) => {
    res.sendFile("/public/pos/ordering/styles.css", { root: rootPath });
});

posRouter.get("/ordering/script.js", (req, res) => {
    res.sendFile("/public/pos/ordering/script.js", { root: rootPath });
});

module.exports = { posRouter };
