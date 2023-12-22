const express = require('express');
const router = express.Router()
const partyControllers = require('../../controllers/party.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");

//write js documentation
// base route: /api/v1/party

router
.route('/')
.get(partyControllers.getAllParties)
.post(authentication, authorization("master", "admin"), partyControllers.addANewParty)

// router
// .route("/my/:id")
// .get(authentication, validateVersion, validateParams, teamControllers.getMyTeamsById)

module.exports = router;