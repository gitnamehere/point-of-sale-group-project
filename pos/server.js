const express = require("express");
const pg = require("pg");

const app = express();

const hostname = "localhost";
const port = 3000;

// TODO: everything

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
