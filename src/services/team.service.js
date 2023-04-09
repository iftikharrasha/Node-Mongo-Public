const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

const getAllTeamsService = async () => {
    const db = getDb();
    const teams = await db.collection("teams").find({}).toArray();
    return teams;
}

module.exports = {
    getAllTeamsService,
}