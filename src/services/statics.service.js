const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

const getLandingStaticsService = async () => {
    const db = getDb();
    const landing = await db.collection("staticLanding").findOne({});
    return landing;
}

module.exports = {
    getLandingStaticsService,
}