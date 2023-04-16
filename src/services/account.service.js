const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");
const User = require("../models/user.model");

const userSignupService = async (data) => {
    const user = await User.create(data);
    return user;
};

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
    userSignupService,
    userLoginService,
    getUserProfileService,
}