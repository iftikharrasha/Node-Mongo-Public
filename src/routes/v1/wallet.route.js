const express = require('express');
const router = express.Router()
const walletControllers = require('../../controllers/wallet.controller');

//write js documentation
// base route: /api/v1/wallet

router
.route('/topup')
.get(walletControllers.getTopups)
.post(walletControllers.createTopup)

router
.route("/topup/:id")
.get(walletControllers.getTopupById)
.patch(walletControllers.updateTopupById)
.delete(walletControllers.deleteTopupById)


module.exports = router;