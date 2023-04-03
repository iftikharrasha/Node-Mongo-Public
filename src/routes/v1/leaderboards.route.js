const express = require('express');
const router = express.Router()
const leaderboardsControllers = require('../../controllers/leaderboards.controller');

//write js documentation
// base route: /api/v1/tournament/leaderboards

router
.route('/:id')
.get(leaderboardsControllers.getLeaderboardDetails)


module.exports = router;