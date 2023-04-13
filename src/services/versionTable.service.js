const { getDb } = require("../utils/dbConnect")
const Version = require('../models/version.model')

const getVersionTableService = async () => {
    // const db = getDb();
    // const versionTable = await db.collection("versionTable").find({}).toArray();
    const versions = await Version.find({});
    return versions;
}

module.exports = {
    getVersionTableService,
}