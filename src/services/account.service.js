const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

const userLoginService = async (emailAddress, password) => {
    const db = getDb();
    const query = { emailAddress: emailAddress, password: password };
    const user = await db.collection("users").findOne(query);
    return user;
}

const getUserProfileService = async (id) => {
    const db = getDb();
    const query = { _id: ObjectId(id) };
    const profile = await db.collection("users").findOne(query);
    return profile;
}

module.exports = {
    userLoginService,
    getUserProfileService,
}