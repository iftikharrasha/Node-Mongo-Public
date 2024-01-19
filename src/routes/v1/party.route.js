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

router
.route('/:id')
.get(validateVersion, validateParams, partyControllers.getPartyDetails)
.post(authentication, validateParams, partyControllers.addUserToParty)

router
.route("/events/:id")
.get(authentication, validateVersion, validateParams, partyControllers.getPartyEventsById)

router
.route('/people/:id')
.get(authentication, validateParams, partyControllers.getPartyPeoplelist)

module.exports = router;