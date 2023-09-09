const express = require('express');
const router = express.Router()
const accountControllers = require('../../controllers/account.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");

//write js documentation
// base route: /api/v1/account

router
.post("/signup", accountControllers.userSignup);

router
.route('/login')
.post(accountControllers.userLogin)

router
.route('/profile/:id')
.get(authentication, validateVersion, validateParams, accountControllers.getUserProfile)
.patch(authentication, authorization("user", "admin"), validateParams, accountControllers.updateProfileById)
.delete(authentication, authorization("admin"), validateParams, accountControllers.deleteProfileById)

//internal routes
router
.route('/list/:id')
.get(authentication, authorization("admin"), validateVersion, validateParams, accountControllers.getUsersList)

router
.route('/gameaccount/:id')
.post(authentication, validateParams, accountControllers.addGameAccount);


module.exports = router;