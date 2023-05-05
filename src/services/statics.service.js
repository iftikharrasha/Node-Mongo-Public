const { getDb } = require("../utils/dbConnect")
const Static = require('../models/static.model');

const getLandingStaticsService = async () => {
    const db = getDb();
    const landing = await db.collection("staticLanding").findOne({});
    return landing;
}

const createStaticService = async (data) => {
    const static = await Static.create(data);
    return static;
}

module.exports = {
    getLandingStaticsService,
    createStaticService
}