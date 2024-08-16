const express = require("express");

const app = express();
const hostname = "localhost";
const port = 3000;

const { apiRouter } = require("./routes/api");

app.use(express.json());
app.use(express.static("public"));

app.use("/api", apiRouter);

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
