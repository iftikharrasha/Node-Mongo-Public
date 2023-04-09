const express = require('express');
const router = express.Router()
const teamControllers = require('../../controllers/team.controller');

//write js documentation
// base route: /api/v1/team

router
.route('/all')
.get(teamControllers.getAllTeams)


module.exports = router;