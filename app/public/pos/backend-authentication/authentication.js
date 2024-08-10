const express = require("express");
const crypto = require("crypto");

const app = express();
const hostname = "localhost";
const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const tokenStorage = {};

const authentication = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1];

    if (!token || !tokenStorage[token]) {
        return res.status(401).json({ error: "Token required."});
    }
    next();
};

const generateRandomToken = () => {
    return crypto.randomBytes(32).toString("hex");
}

app.get("/api/auth/demoKey", (req, res) => {
    const token = generateRandomToken();
    tokenStorage[token] = true;
    console.log(tokenStorage); //keep track of tokens created
    return res.json({ token });
})

app.get("/pos/", authentication, (req, res) => {
    return res.status(200);
});

app.listen(port, hostname, () => {
    console.log(`http://${hostname}:${port}`);
});
