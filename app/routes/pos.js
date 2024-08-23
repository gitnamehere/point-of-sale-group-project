const express = require("express");
const posRouter = express.Router();
const cookieParser = require("cookie-parser");
const { authentication } = require("./api.js");

posRouter.use(express.static("frontend/public/pos"));
posRouter.use(cookieParser()); // we need this here otherwise authentication wont work
posRouter.use(authentication);
posRouter.use(express.static("frontend/private/pos"));

module.exports = { posRouter };
