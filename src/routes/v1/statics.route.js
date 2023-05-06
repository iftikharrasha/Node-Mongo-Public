const express = require('express');
const router = express.Router()
const staticsControllers = require('../../controllers/statics.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");

//write js documentation
// base route: /api/v1/statics

router
.route('/')
.get(validateVersion, staticsControllers.getLandingStatics)
.post(authentication, authorization("admin"), staticsControllers.createStatic)

module.exports = router;