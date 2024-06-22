const express = require('express');
const router = express.Router()
const gemControllers = require('../../controllers/gem.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateParams = require("../../middlewares/validateParams");
const validateVersion = require("../../middlewares/validateVersion");

//write js documentation
// base route: /api/v1/geminy

router
.route('/:id')
.get(authentication, validateParams, gemControllers.getGemPrice)

module.exports = router;