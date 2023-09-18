const User = require("../models/user.model");
const GameAccount = require("../models/gameaccount.model");

const excludedUserFields = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v';
const excludedGameAccountFields = '-version -uId -updatedAt -createdAt -__v';

const userSignupService = async (data) => {
    const user = await User.create(data);
    return user;
};

const findUserByEmail = async (emailAddress) => {
    return await User.findOne({ emailAddress })
                    .populate({
                        path: 'gameAccounts',
                        select: excludedGameAccountFields,
                    });
};

const findUserById = async (id) => {
    return await User.findOne({ _id: id })
                    .populate({
                        path: 'gameAccounts',
                        select: excludedGameAccountFields,
                    });
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
};

const addGameAccountService = async (id, data) => {
    const gameaccount = await GameAccount.create(data);
    return gameaccount;
};

const gameAccountConnectToUser = async (uId, gameId) => {
    //pushing user id inside the tournament leaderboard
    const currentUser = await User.findOne({ _id: uId });
    console.log(gameId, currentUser)

    if(currentUser){
        const result = await User.findOneAndUpdate(
            { _id: currentUser._id },
            {  $push: { "gameAccounts": gameId } },
            { new: true }
        );
        
        return result;
    }else{
        return false
    }
}

const friendRequestService = async (data) => {
    const { from, to, type } = data;
  
    // Update based on the request type
    switch (type) {
        case 'friend_request_send':
            // Update the sender's 'friend.sent'
            await User.findOneAndUpdate(
                { _id: from },
                { $push: { 'requests.friend.sent': to } }
            );

            // Update the receiver's 'friend.pending'
            await User.findOneAndUpdate(
                { _id: to },
                { $push: { 'requests.friend.pending': from } }
            );
            
            return { success: true, message: `Friend request sent from ${from} to ${to}` };
  
        case 'friend_request_accept':
            // Update the sender's 'friend.mutuals'
            await User.findOneAndUpdate(
              { _id: from },
              { $push: { 'requests.friend.mutuals': to } }
            );
            // Update the receiver's 'friend.mutuals'
            await User.findOneAndUpdate(
              { _id: to },
              { $push: { 'requests.friend.mutuals': from } }
            );
      
            // Remove the request from the sender's 'friend.sent'
            await User.findOneAndUpdate(
              { _id: from },
              { $pull: { 'requests.friend.sent': to } }
            );
            // Remove the request from the receiver's 'friend.pending'
            await User.findOneAndUpdate(
              { _id: to },
              { $pull: { 'requests.friend.pending': from } }
            );
            return { success: true, message: `Friend request accepted between ${from} and ${to}` };
  
        case 'friend_request_reject':
            // Remove the request from the sender's 'friend.sent'
            await User.findOneAndUpdate(
            { _id: from },
            { $pull: { 'requests.friend.sent': to } }
            );
            // Remove the request from the receiver's 'friend.pending'
            await User.findOneAndUpdate(
            { _id: to },
            { $pull: { 'requests.friend.pending': from } }
            );
            return { success: true, message: `Friend request rejected from ${from} to ${to}` };
        
        case 'friend_request_unfriend':
            // Remove from as a mutual friend of to
            await User.findOneAndUpdate(
                { _id: to },
                { $pull: { 'requests.friend.mutuals': from } }
            );
            // Remove to as a mutual friend of from
            await User.findOneAndUpdate(
                { _id: from },
                { $pull: { 'requests.friend.mutuals': to } }
            );
            return { success: true, message: `${from} unfriended ${to}` };
  
        default:
            return { success: false, message: 'Invalid request type' };
    }
  };

// const updateXp = async (id, newXp) => {
//     const currentProfile = await User.findOne({ _id: id });
  
//     const updatedProfile = {
//         ...currentProfile.toObject(),
//         stats: {
//             ...currentProfile.stats,
//             totalXp: currentProfile.stats.totalXp + newXp,
//             currentXP: currentProfile.stats.currentXP + newXp
//         },
//         version: currentProfile.version + 1,
//     };
  
//     const result = await User.findOneAndUpdate(
//       { _id: id },
//       updatedProfile,
//       { new: true, runValidators: true }
//     );
  
//     return true;
// };  

const updateXp = async (id, newXp) => {
    const currentProfile = await User.findOne({ _id: id });
  
    const totalXp = currentProfile.stats.totalXp + newXp;
    let currentXP = currentProfile.stats.currentXP + newXp;
    let levelTitle = currentProfile.stats.levelTitle;
    let currentLevel = currentProfile.stats.currentLevel;
    let nextLevelRequiredXP = currentProfile.stats.nextLevelRequiredXP;
  
    if (totalXp >= 140 && totalXp < 500) {
      levelTitle = "rockie";
      currentLevel = 2;
      nextLevelRequiredXP = 500 - currentXP;
      currentXP = totalXp - 140;
    } else if (totalXp >= 500 && totalXp < 1000) {
      levelTitle = "pro";
      currentLevel = 3;
      nextLevelRequiredXP = 1000 - currentXP;
      currentXP = totalXp - 500;
    }
  
    const updatedProfile = {
      ...currentProfile.toObject(),
      stats: {
        ...currentProfile.stats,
        totalXp,
        currentXP,
        levelTitle,
        currentLevel,
        nextLevelRequiredXP,
      },
      version: currentProfile.version + 1,
    };
  
    const result = await User.findOneAndUpdate(
      { _id: id },
      updatedProfile,
      { new: true, runValidators: true }
    );
  
    return true;
  };
  

const deleteProfileByIdService = async (id) => {
    const result = await User.findByIdAndDelete({ _id: id });
    return result;
};

const addPurchasedItemToUserService = async (tId, uId) => {
    //pushing tournament id inside the user
    const currentUser = await User.findOne({ _id: uId });

    if(currentUser){
        if (currentUser.purchasedItems.tournaments.indexOf(tId) !== -1) {
            return false
        } else {
            const result = await User.findOneAndUpdate(
                { _id: currentUser._id },
                {  $push: { "purchasedItems.tournaments": tId } },
                { new: true }
            );
            
            return result;
        }
    }else{
        return false
    }
};

//internal
const getUsersListService = async (id) => {
    const users = await User.find({ _id: { $ne: id } }) 
                                .sort({createdAt: -1})
                                .select(excludedUserFields) // Exclude the 'password' field
                                // .populate({
                                //     path: 'purchasedItems.tournaments',
                                //     select: excludedMasterFields,
                                //     match: { _id: { $ne: id } } //we get users without the admin
                                // });
    
    return users;
}
  

module.exports = {
    userSignupService,
    findUserByEmail,
    findUserById,
    updateProfileByIdService,
    deleteProfileByIdService,
    addPurchasedItemToUserService,
    getUsersListService,
    updateXp,
    addGameAccountService,
    gameAccountConnectToUser,
    friendRequestService,
}