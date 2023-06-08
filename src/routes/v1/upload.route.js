const express = require('express');
const router = express.Router()
const tournamentControllers = require('../../controllers/tournament.controller');
const validateParams = require("../../middlewares/validateParams");
const fileUpload = require('../../middlewares/fileUpload');

// base route: /api/v1/upload

router
.route('/:id')
.post(validateParams, fileUpload, tournamentControllers.addNewFile)

module.exports = router;