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
.get(authentication, validateVersion, validateParams, partyControllers.getPartyDetails)
.post(authentication, validateParams, partyControllers.addUserToParty)
.patch(authentication, validateParams, partyControllers.controlUserRequestToJoinParty)

router
.route('/socials/:id')
.get(validateVersion, validateParams, partyControllers.getPartySocialPostsId)
.post(authentication, validateParams, partyControllers.addPostToParty)

router
.route('/comments/:id')
.get(validateVersion, validateParams, partyControllers.getPartySocialsCommentsById)
.post(authentication, validateParams, partyControllers.addCommentToPartyPost)

router
.route('/reacts/:id')
.post(authentication, validateParams, partyControllers.addReactToPartyPost)

router
.route("/events/:id")
.get(validateVersion, validateParams, partyControllers.getPartyEventsById)

router
.route('/people/:id')
.get(authentication, validateParams, partyControllers.getPartyPeoplelist)

module.exports = router;