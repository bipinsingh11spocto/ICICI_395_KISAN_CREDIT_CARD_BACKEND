const express = require("express");
const { event, kisancreditcardControllar } = require("../controllers");

const kisancreditcardRouter = express.Router();

kisancreditcardRouter.post("/add-events", event.addEvents);
kisancreditcardRouter.post("/getdata", kisancreditcardControllar.getPrevData);
kisancreditcardRouter.post("/sr-generate", kisancreditcardControllar.generateSrNo);
kisancreditcardRouter.post("/kalera-connect", kisancreditcardControllar.kaleraconnect);
kisancreditcardRouter.post("/callstatusupdate", kisancreditcardControllar.updateCallStatus);
kisancreditcardRouter.get("/get-steps", kisancreditcardControllar.getCurrentSteps);

module.exports = { kisancreditcardRouter };