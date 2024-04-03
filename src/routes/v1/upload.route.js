const express = require('express');
const router = express.Router()
const tournamentControllers = require('../../controllers/tournament.controller');
const partyControllers = require('../../controllers/party.controller');
const validateParams = require("../../middlewares/validateParams");
const fileUpload = require('../../middlewares/fileUpload');
const authentication = require("../../middlewares/authentication");

// base route: /api/v1/upload

router
.route('/:id')
.post(authentication, validateParams, partyControllers.makeImageReady)

router
.route('/tournaments/:id')
.post(authentication, validateParams, fileUpload, tournamentControllers.addTournamentImage)

router
.route('/partypost/:id')
.post(authentication, validateParams, fileUpload, partyControllers.addPartyImage)

module.exports = router;