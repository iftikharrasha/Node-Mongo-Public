const { getDb } = require("../utils/dbConnect")

const getVersionTableService = async () => {
    const db = getDb();
    const versionTable = await db.collection("versionTable").find({}).toArray();
    return versionTable;
}

module.exports = {
    getVersionTableService,
}