const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");
const Team = require('../models/team.model');

const getAllTeamsService = async () => {
    const db = getDb();
    const teams = await db.collection("teams").find({}).toArray();
    return teams;
}

const createTeamService = async (data) => {
    const team = await Team.create(data);
    return team;
}

module.exports = {
    getAllTeamsService,
    createTeamService,
}