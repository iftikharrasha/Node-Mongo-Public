// const { getDb } = require("../utils/dbConnect")
// const { ObjectId } = require("mongodb");
const User = require("../models/user.model");

const userSignupService = async (data) => {
    const user = await User.create(data);
    return user;
};

// const userLoginService = async (emailAddress, password) => {
//     const db = getDb();
//     const query = { emailAddress: emailAddress, password: password };
//     const user = await db.collection("users").findOne(query);
//     return user;
// }

// const getUserProfileService = async (id) => {
//     const db = getDb();
//     const query = { _id: ObjectId(id) };
//     const profile = await db.collection("users").findOne(query);
//     return profile;
// }

const findUserByEmail = async (emailAddress) => {
    return await User.findOne({ emailAddress });
};

const findUserById = async (id) => {
    return await User.findOne({ _id: id });
};

const updateProfileByIdService = async (id, data) => {
    const currentProfile = await User.findById(id);

    const updatedProfile = {
        ...currentProfile.toObject(),
        ...data,
        version: currentProfile.version + 1 // increment the version field
    };

    const result = await User.findByIdAndUpdate({ _id: id }, updatedProfile, {
      new: true,
      runValidators: true
    });
    return result;
}

const deleteProfileByIdService = async (id) => {
    const result = await User.findByIdAndDelete({ _id: id });
    return result;
};

module.exports = {
    userSignupService,
    findUserByEmail,
    findUserById,
    // userLoginService,
    // getUserProfileService,
    updateProfileByIdService,
    deleteProfileByIdService,
}