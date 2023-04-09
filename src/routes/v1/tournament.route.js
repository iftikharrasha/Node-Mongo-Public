const express = require('express');
const router = express.Router()
const tournamentControllers = require('../../controllers/tournament.controller');
const viewCount = require('../../middlewares/viewCount');

//write js documentation
// base route: /api/v1/tournament

router
.route('/all') //slash means the base route
.get(tournamentControllers.getAllTournaments)
// .post(tournamentControllers.saveTournaments)

router
.route('/:id')
.get(viewCount, tournamentControllers.getTournamentDetails)
// viewCount is router level middleware example

router
.route('/add')
.post(tournamentControllers.addANewTournament)

router
.route('/update/:id')
.patch(tournamentControllers.updateTournamentDetails)

router
.route('/delete/:id')
.delete(tournamentControllers.deleteTournamentDetails)

router
.route('/leaderboards/:id')
.get(tournamentControllers.getLeaderboardDetails)

//and so on

module.exports = router;