const express = require('express');
const router = express.Router()
const staticsControllers = require('../../controllers/statics.controller');

//write js documentation
// base route: /api/v1/statics

router
.route('/landing')
.get(staticsControllers.getLandingStatics)


module.exports = router;