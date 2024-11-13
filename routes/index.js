const express = require("express");
const { kisancreditcardRouter } = require("./kisancreditcardroute");

const apiRouter = express.Router();

apiRouter.use("/kisancreditcard", kisancreditcardRouter);

module.exports = {
    apiRouter
};