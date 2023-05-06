const express = require('express');
const router = express.Router()
const teamControllers = require('../../controllers/team.controller');
const authentication = require("../../middlewares/authentication");
const authorization = require("../../middlewares/authorization");
const validateVersion = require("../../middlewares/validateVersion");
const validateParams = require("../../middlewares/validateParams");

//write js documentation
// base route: /api/v1/teams

router
.route('/')
.get(teamControllers.getAllTeams)
.post(authentication, teamControllers.addANewTeam)

router
.route("/my/:id")
.get(authentication, validateVersion, validateParams, teamControllers.getMyTeamsById)

module.exports = router;