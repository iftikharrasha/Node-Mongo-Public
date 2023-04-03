const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

// const getLeaderboardsService = async () => {
//     const db = getDb();
//     const leaderboard = await db.collection("leaderboards").find({}).toArray();
//     return leaderboard;
// }

const getLeaderboardDetailsService = async (id) => {
    const db = getDb();
    const query = { tId: id };
    const tournament = await db.collection("leaderboards").findOne(query);
    return tournament;
}

module.exports = {
    getLeaderboardDetailsService,
}