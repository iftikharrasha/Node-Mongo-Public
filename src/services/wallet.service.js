const { getDb } = require("../utils/dbConnect")
const { ObjectId } = require("mongodb");

const getTopupGifcardsService = async () => {
    const db = getDb();
    const giftcards = await db.collection("giftcards").find({}).toArray();
    return giftcards;
}

module.exports = {
    getTopupGifcardsService,
}