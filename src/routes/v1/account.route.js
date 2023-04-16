const express = require('express');
const router = express.Router()
const accountControllers = require('../../controllers/account.controller');

//write js documentation
// base route: /api/v1/account

router
.post("/signup", accountControllers.userSignup);

router
.route('/login')
.post(accountControllers.userLogin)

router
.route('/profile/:id')
.get(accountControllers.getUserProfile)


module.exports = router;