const express = require('express');
const router = express.Router()
const authentication = require("../../middlewares/authentication");
const supportControllers = require('../../controllers/support.controller');
const validateParams = require("../../middlewares/validateParams");
const authorization = require("../../middlewares/authorization");
const cache = require("../../middlewares/caching");

//write js documentation
// base route: /api/v1/support

router
.route('/:id')
.get(authentication, validateParams, supportControllers.getMySupportTickets)
.post(authentication, validateParams, supportControllers.createSupportTicket)


router
.route('/all/:id')
.get(authentication, authorization("admin"), validateParams, supportControllers.getAllSupportTickets)

router
.route('/thread/:id')
.get(authentication, validateParams, supportControllers.getSupportTicketDetails)
.post(authentication, validateParams, supportControllers.createSupportComment)

router
.route('/status/:id')
.get(authentication, authorization("admin"), validateParams, supportControllers.updateSupportStatus)

module.exports = router;