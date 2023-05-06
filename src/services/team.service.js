const { getDb } = require("../utils/dbConnect")
const Team = require('../models/team.model');

const getAllTeamsService = async () => {
    const db = getDb();
    const teams = await db.collection("teams").find({}).toArray();
    return teams;
}

const getMyTeamsByIdService = async (id) => {
    const topup = await Team.find({ captainId: id });
    return topup;
}

const createTeamService = async (data) => {
    const team = await Team.create(data);
    return team;
}

module.exports = {
    getAllTeamsService,
    getMyTeamsByIdService,
    createTeamService,
}