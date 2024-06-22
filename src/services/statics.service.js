
const Static = require('../models/static.model');
// const Purchase = require('../models/purchase.model');
// const Tournament = require('../models/tournament.model');
// const User = require('../models/user.model');

const getLandingStaticsService = async () => {
    const static = await Static.findOne({})
    // const purchaseUpdate = await updateAllPurchasesService(); //this is to shortcut edit database
    // const tournamentUpdate = await updateAllTournamentsService();
    // const usersUpdate = await updateAllUsersService();
    return static;
}

const createStaticService = async (data) => {
    const static = await Static.create(data);
    return static;
}

// const updateAllPurchasesService = async () => {
//     try {
//         const result = await Purchase.updateMany(
//             {}, // Empty filter to match all documents
//             { 
//                 $set: { 
//                     amount: 1,
//                     method: "aquamarine", 
//                     currency: "gem",
//                     activity: "expense"
//                 } 
//             }
//         );
//         console.log(`Successfully updated purchases.`);
//     } catch (error) {
//         console.error('Error updating purchases:', error);
//     }
//     return true;
// };

// const updateAllTournamentsService = async () => {
//     try {
//         const result = await Tournament.updateMany(
//             {}, // Empty filter to match all documents
//             { 
//                 $set: { 
//                     'settings.pot': 0, 
//                     // 'settings.joiningFee': 1, 
//                     // 'settings.feeType': "aquamarine" 
//                 }
//             }
//         );
//         console.log(`Successfully updated tournament.`);
//     } catch (error) {
//         console.error('Error updating tournament:', error);
//     }
//     return true;
// };

// const updateAllUsersService = async () => {
//     try {
//         const result = await User.updateMany(
//             {}, // Empty filter to match all documents
//             { 
//                 $set: { 
//                     'stats.totalGems': 10, 
//                     'stats.aquamarine': 10, 
//                     'stats.tourmaline': 0
//                 }
//             }
//         );
//         console.log(`Successfully updated users.`);
//     } catch (error) {
//         console.error('Error updating users:', error);
//     }
//     return true;
// };

module.exports = {
    getLandingStaticsService,
    createStaticService
}