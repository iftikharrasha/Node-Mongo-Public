const express = require('express');
const router = express.Router()
const accountControllers = require('../../controllers/account.controller');
const verifyVersion = require("../../middlewares/verifyVersion");

//write js documentation
// base route: /api/v1/account

router
.post("/signup", accountControllers.userSignup);

router
.route('/login')
.post(accountControllers.userLogin)

router
.route('/profile/:id')
.get(verifyVersion, accountControllers.getUserProfile)
.patch(verifyVersion, accountControllers.updateProfileById)
.delete(verifyVersion, accountControllers.deleteProfileById)


module.exports = router;