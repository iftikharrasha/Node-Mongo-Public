const { getDb } = require("../utils/dbConnect")
// const { ObjectId } = require("mongodb");
const Tournament = require('../models/tournament.model')

const excludedFields = { 
    firstName: 0,
    lastName: 0,
    status: 0,
    balance: 0,
    password: 0,
    dateofBirth: 0,
    version: 0,
    permissions: 0,
    address: 0,
    teams: 0,
    requests: 0,
    stats: 0,
    socials: 0,
    updatedAt: 0,
    __v: 0
};

const getAllTournamentsService = async () => {
    // const db = getDb();
    // const tournaments = await db.collection("tournaments").find({}).toArray();
    const tournaments = await Tournament.find({}).populate('masterProfile', excludedFields);
    return tournaments;
}

const getTournamentDetailsService = async (id) => {
    // const db = getDb();
    // const query = { _id: ObjectId(id) };
    // const tournament = await db.collection("tournaments").findOne(query);
    const tournament = await Tournament.findOne({ _id: id }).populate('masterProfile', excludedFields);
    return tournament;
}

const getLeaderboardDetailsService = async (id) => {
    const db = getDb();
    const query = { tId: id };
    const tournament = await db.collection("leaderboards").findOne(query);
    return tournament;
}

const createTournamentService = async (data) => {
    const tournament = await Tournament.create(data);
    return tournament;
}

const updateTournamentByIdService = async (id, data) => {
    const currentTournament = await Tournament.findById(id);

    const updatedTournament = {
        ...currentTournament.toObject(),
        ...data,
        version: currentTournament.version + 1 // increment the version field
    };

    const result = await Tournament.findByIdAndUpdate({ _id: id }, updatedTournament, {
      new: true,
      runValidators: false
    });
    return result;
}

const deleteTournamentByIdService = async (id) => {
    const result = await Tournament.findByIdAndDelete({ _id: id });
    return result;
};

module.exports = {
    createTournamentService,
    getAllTournamentsService,
    getTournamentDetailsService,
    getLeaderboardDetailsService,
    updateTournamentByIdService,
    deleteTournamentByIdService
}