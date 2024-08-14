const express = require("express");

const app = express();
const hostname = "localhost";
const port = 3000;

const api = require("./routes/api");

app.use(express.json());
app.use(express.static("public"));

app.use("/api", api);

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
