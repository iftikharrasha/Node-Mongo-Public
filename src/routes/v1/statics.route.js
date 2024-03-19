const express = require('express');
const router = express.Router()
const staticsControllers = require('../../controllers/statics.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const cache = require("../../middlewares/caching");

//write js documentation
// base route: /api/v1/statics

router
.route('/')
.get(validateVersion, cache(300), staticsControllers.getLandingStatics)
.post(authentication, authorization("admin"), staticsControllers.createStatic)

router
.route('/payment/create-checkout-session')
.post(staticsControllers.stripPayment)

module.exports = router;