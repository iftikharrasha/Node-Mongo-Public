// const { getDb } = require("../utils/dbConnect")
const Topup = require('../models/topup.model')

const createTopupService = async (data) => {
    const topup = await Topup.create(data);
    return topup;
}

const getTopupsService = async () => {
    // const db = getDb();
    // const giftcards = await db.collection("giftcards").find({}).toArray();
    const topups = await Topup.find({});
    return topups;
}

const getTopupByIdService = async (id) => {
    const topup = await Topup.findOne({ _id: id });
    return topup;
}

const updateTopupByIdService = async (id, data) => {
    const currentTopup = await Topup.findById(id);

    const updatedTopup = {
        ...currentTopup.toObject(),
        ...data,
        version: currentTopup.version + 1 // increment the version field
    };

    const result = await Topup.findByIdAndUpdate({ _id: id }, updatedTopup, {
      new: true,
      runValidators: true
    });
    return result;
}

const deleteTopupByIdService = async (id) => {
    const result = await Topup.findByIdAndDelete({ _id: id });
    return result;
};

module.exports = {
    getTopupsService,
    getTopupByIdService,
    createTopupService,
    updateTopupByIdService,
    deleteTopupByIdService,
}