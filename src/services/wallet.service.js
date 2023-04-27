const Topup = require('../models/topup.model')
const Purchase = require('../models/purchase.model')
const Transaction = require('../models/transaction.model')

// const excludedMasterFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -requests -stats -socials -updatedAt -__v';

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

const addToPurchaseService = async (data) => {
    const purchase = await Purchase.create(data);
    return purchase;
};

const getMyTransactionsByIdService = async (id) => {
    const transaction = await Transaction.findOne({ uId: id })
                                        // .populate({
                                        //     path: 'transactions',
                                        //     select: excludedUserFields,
                                        //     match: { status: { $ne: 'blocked' } } //we get users who are not blocked
                                        // });
    return transaction;
}

// const addPurchaseToTransactions = async (uId, pId) => {
//     //pushing user id inside separate leaderboard
//     const currentTransaction = await Transaction.findOne({ uId: uId });

//     if (currentTransaction.transactions.indexOf(pId) !== -1) {
//         return false
//     } else {
//         const result = await Transaction.findOneAndUpdate(
//             { _id: currentTransaction._id },
//             { $push: { transactions: { $each: [pId], $position: 0 } }, $inc: { version: 1 } },
//             { new: true }
//         );
        
//         return result;
//     }
// };

module.exports = {
    getTopupsService,
    getTopupByIdService,
    createTopupService,
    updateTopupByIdService,
    deleteTopupByIdService,
    addToPurchaseService,
    getMyTransactionsByIdService
}