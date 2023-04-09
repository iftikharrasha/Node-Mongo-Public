const express = require('express');
const router = express.Router()
const walletControllers = require('../../controllers/wallet.controller');

//write js documentation
// base route: /api/v1/wallet

router
.route('/topup')
.get(walletControllers.getTopupGifcards)


module.exports = router;