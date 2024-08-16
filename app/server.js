const express = require("express");

const app = express();
const hostname = "localhost";
const port = 3000;

const { apiRouter } = require("./routes/api");
const { posRouter } = require("./routes/pos");

app.use(express.json());
app.use(express.static("public/store"));

app.use("/api", apiRouter);
app.use("/pos", posRouter);

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
