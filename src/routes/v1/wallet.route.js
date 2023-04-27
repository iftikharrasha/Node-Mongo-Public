const express = require('express');
const router = express.Router()
const walletControllers = require('../../controllers/wallet.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");

// base route: /api/v1/wallet

router
.route('/topup')
.get(authentication, authorization("user", "admin"), validateVersion, walletControllers.getTopups)
.post(authentication, authorization("admin"), walletControllers.createTopup)

router
.route("/topup/:id")
.get(authentication, authorization("user", "admin"), validateVersion, validateParams, walletControllers.getTopupById)
.patch(authentication, authorization("admin"), validateParams, walletControllers.updateTopupById)
.delete(authentication, authorization("admin"), validateParams, walletControllers.deleteTopupById)

router
.route("/transactions/:id")
.get(authentication, authorization("user", "admin"), validateVersion, validateParams, walletControllers.getMyTransactionsById)

module.exports = router;