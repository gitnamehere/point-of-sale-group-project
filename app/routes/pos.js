const express = require("express");
const posRouter = express.Router();
const cookieParser = require("cookie-parser");
const { authentication } = require("./api.js");

posRouter.use(cookieParser()); // we need this here otherwise authentication wont work
posRouter.use(authentication);
posRouter.use(express.static("public/pos")); // we should probably move the "private" pos folder into a separate directory

module.exports = { posRouter };
