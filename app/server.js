const express = require("express");

const app = express();
const hostname = "localhost";
const port = 3000;

const { apiRouter } = require("./routes/api");
const { posRouter } = require("./routes/pos");
const { storeRouter } = require("./routes/store");

app.use(express.json());

app.use("/api", apiRouter);
app.use("/pos", posRouter);
app.use("/store", storeRouter);

app.get("/", (req, res) => {
    res.sendFile("/public/index.html", { root: __dirname });
});

app.get("/style.css", (req, res) => {
    res.sendFile("/public/style.css", { root: __dirname });
});

app.get("/index.js", (req, res) => {
    res.sendFile("/public/index.js", { root: __dirname });
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
