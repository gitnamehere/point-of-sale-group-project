const express = require("express");
const storeRouter = express.Router();

// for future use

storeRouter.use(express.static("frontend/public/store"));

module.exports = { storeRouter };
