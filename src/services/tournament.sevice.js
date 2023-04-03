const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

const getAllTournamentsService = async () => {
    const db = getDb();
    const tournaments = await db.collection("tournaments").find({}).toArray();
    return tournaments;
}

const getTournamentDetailsService = async (id) => {
    const db = getDb();
    const query = { _id: ObjectId(id) };
    const tournament = await db.collection("tournaments").findOne(query);
    return tournament;
}

module.exports = {
    getAllTournamentsService,
    getTournamentDetailsService,
}