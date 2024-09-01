const express = require("express");
const app = express();

// code adapted from the fly deployment demo

// make this script's dir the cwd
// b/c npm run start doesn't cd into src/ to run this
// and if we aren't in its cwd, all relative paths will break
process.chdir(__dirname);

const port = 3000;
let hostname;
// fly.io sets NODE_ENV to production automatically, otherwise it's unset when running locally
hostname = process.env.NODE_ENV == "production" ? "0.0.0.0" : "localhost";

const { apiRouter, pool } = require("./routes/api");
const { posRouter } = require("./routes/pos");
const { storeRouter } = require("./routes/store");

// TODO: Everything

app.use(express.json());
app.use("/api", apiRouter);
app.use("/pos", posRouter);
app.use("/store", storeRouter);

app.get("/", (req, res) => {
    res.sendFile("/frontend/public/index.html", { root: __dirname });
});

app.get("/style.css", (req, res) => {
    res.sendFile("frontend/public/style.css", { root: __dirname });
});

app.get("/index.js", (req, res) => {
    res.sendFile("frontend/public/index.js", { root: __dirname });
});

app.get("/business-info.js", (req, res) => {
    res.sendFile("frontend/files/business-info.js", { root: __dirname });
});

app.get("/themes.js", (req, res) => {
    res.sendFile("frontend/files/themes.js", { root: __dirname });
});

app.get("/themes.css", (req, res) => {
    pool.query("SELECT * FROM themes")
        .then((result) => {
            const { background_color, primary_color, secondary_color } =
                result.rows[0];
            res.send(`body {
    background-color: "${background_color}" !important;
}

.primary-background {
    background-color: "${primary_color}";
}

.primary-text {
    color: "${primary_color}";
}

.secondary-background {
    background-color: "${secondary_color}";
}

.secondary-text {
    color: "${secondary_color}";
}`);
        })
        .catch((error) => {
            console.log(error);
        });
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
