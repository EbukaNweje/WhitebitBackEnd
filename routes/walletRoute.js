const express = require("express");
const { makeDeposit } = require("../controller/walletController");
const { userAuth } = require("../middlewares/authmiddleware");

const router = express.Router();

router.post("/makedeposit", userAuth, makeDeposit);

module.exports = router;
