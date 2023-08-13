const express = require('express');
const router = express.Router()
const tournamentControllers = require('../../controllers/tournament.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");
const viewCount = require('../../middlewares/viewCount');
const cache = require("../../middlewares/caching");

// write js documentation
// base route: /api/v1/tournaments

router
.route('/')
.get(validateVersion, cache(300), tournamentControllers.getAllTournaments)
.post(authentication, authorization("master", "admin"), tournamentControllers.addANewTournament)

router
.route('/by')
.get(validateVersion, cache(300), tournamentControllers.getAllTournamentsFiltered)

router
.route('/:id')
.get(validateVersion, validateParams, viewCount, tournamentControllers.getTournamentDetails)
.patch(authentication, authorization("master", "admin"), validateParams, tournamentControllers.updateTournamentDetails)
.delete(authentication, authorization("master", "admin"), validateParams, tournamentControllers.deleteTournamentDetails)
// viewCount is router level middleware example

router
.route('/leaderboards/:id')
.get(validateVersion, validateParams, tournamentControllers.getLeaderboards)

router
.route('/bracket/:id')
.get(validateVersion, validateParams, tournamentControllers.getBracket)

router
.route('/credentials/:id')
.get(authentication, validateParams, tournamentControllers.getCredentials)
.patch(authentication, authorization("master", "admin"), validateParams, tournamentControllers.updateCredentials)

router
.route('/result/:id')
.patch(authentication, authorization("master", "admin"), validateParams, tournamentControllers.updateResult)

router
.route('/registration/:id')
.post(authentication, validateParams, tournamentControllers.tournamentRegistration)

router
.route('/master/:id')
.get(validateVersion, validateParams, tournamentControllers.getAllMasterTournaments)

// router
// .route('/master/:id/credentials/:tid')
// .post(validateVersion, validateParams, tournamentControllers.getAllMasterTournaments)

router
.route('/internal/:id')
.get(validateVersion, validateParams, tournamentControllers.getAllInternalTournaments)

router
.route('/approve/:id')
.patch(authentication, authorization("admin"), validateParams, tournamentControllers.updateTournamentApproval)

module.exports = router;