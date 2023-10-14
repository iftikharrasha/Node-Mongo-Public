const User = require("../models/user.model");
const GameAccount = require("../models/gameaccount.model");

const excludedUserFields = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v';
const excludedUserFieldsForFriendList = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v -balance -emailAddress -gameAccounts -mobileNumber -permissions -purchasedItems -status';
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
            {  $inc: { version: 1 }, $push: { "gameAccounts": gameId } },
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
                { $inc: { version: 1 }, $push: { 'requests.friend.sent': to } }
            );

            // Update the receiver's 'friend.pending'
            await User.findOneAndUpdate(
                { _id: to },
                { $inc: { version: 1 }, $push: { 'requests.friend.pending': from } }
            );
            
            return { success: true, message: `You've sent a friend request`, xp: true };
  
        case 'friend_request_accept':
            // Update the sender's 'friend.mutuals' and Remove the request from the receiver's 'friend.pending'
            await User.findOneAndUpdate(
              { _id: from },
              { $inc: { version: 1, friends: 1 }, 
                $push: { 'requests.friend.mutuals': to },
                $pull: { 'requests.friend.pending': to }
              }
            );
            // Update the receiver's 'friend.mutuals' and Remove the request from the sender's 'friend.sent'
            await User.findOneAndUpdate(
              { _id: to },
              { $inc: { version: 1, friends: 1 }, 
                $push: { 'requests.friend.mutuals': from },
                $pull: { 'requests.friend.sent': from } 
              }
            );
      
            return { success: true, message: `You've made a new friend`, xp: true };
  
        case 'friend_request_reject':
            // Remove the request from the sender's 'friend.sent'
            await User.findOneAndUpdate(
                { _id: to },
                { $inc: { version: 1 }, $pull: { 'requests.friend.sent': from } }
            );
            // Remove the request from the receiver's 'friend.pending'
            await User.findOneAndUpdate(
                { _id: from },
                { $inc: { version: 1 }, $pull: { 'requests.friend.pending': to } }
            );
            return { success: true, message: `You've rejected the friend request`, xp: false };
        
        case 'friend_request_unfriend':
            // Remove from as a mutual friend of to
            await User.findOneAndUpdate(
                { _id: to },
                { $inc: { version: 1 }, $pull: { 'requests.friend.mutuals': from } }
            );
            // Remove to as a mutual friend of from
            await User.findOneAndUpdate(
                { _id: from },
                { $inc: { version: 1 }, $pull: { 'requests.friend.mutuals': to } }
            );
            return { success: true, message: `You succesfully unfirend the person`, xp: false };
  
        default:
            return { success: false, message: 'Invalid request type', xp: false };
    }
};

const getfriendlistService = async (id) => {
    const currentProfile = await User.findOne({ _id: id })
                                .select('requests.friend.sent requests.friend.mutuals requests.friend.pending requests.follow.following requests.follow.follower')
                                .populate({
                                    path: 'requests.friend.sent requests.friend.mutuals requests.friend.pending requests.follow.following requests.follow.follower',
                                    select: excludedUserFieldsForFriendList,
                                });
    
    return currentProfile
};

const updateXp = async (id, newXp) => {
    const currentProfile = await User.findOne({ _id: id });
  
    const totalXp = currentProfile.stats.totalXp + newXp;
    let currentXP = currentProfile.stats.currentXP + newXp;
    let levelTitle = currentProfile.stats.levelTitle;
    let currentLevel = currentProfile.stats.currentLevel;
    let nextLevelRequiredXP = currentProfile.stats.nextLevelRequiredXP;

    if (totalXp > 500 && totalXp < 2000) {
        levelTitle = "rookie";
        currentLevel = 2;  
        nextLevelRequiredXP = 2000 - currentXP;
        currentXP = totalXp - 500;
    } else if (totalXp > 500 && totalXp < 2000) {
        levelTitle = "explorer";
        currentLevel = 3;  
        nextLevelRequiredXP = 2000 - currentXP;
        currentXP = totalXp - 500;
    } else if (totalXp >= 2000 && totalXp < 4000) {
        levelTitle = "collector";
        currentLevel = 4;
        nextLevelRequiredXP = 4000 - currentXP;
        currentXP = totalXp - 2000;
    } else if (totalXp >= 4000 && totalXp < 8000) {
        levelTitle = "collaborator";
        currentLevel = 5;
        nextLevelRequiredXP = 8000 - currentXP;
        currentXP = totalXp - 4000;
    } else if (totalXp >= 8000 && totalXp < 16000) {
        levelTitle = "contributor";
        currentLevel = 6;
        nextLevelRequiredXP = 16000 - currentXP;
        currentXP = totalXp - 8000;
    } else if (totalXp >= 16000 && totalXp < 32000) {
        levelTitle = "rising star";
        currentLevel = 7;
        nextLevelRequiredXP = 32000 - currentXP;
        currentXP = totalXp - 16000;
    } else if (totalXp >= 32000 && totalXp < 64000) {
        levelTitle = "professional";
        currentLevel = 8;
        nextLevelRequiredXP = 64000 - currentXP;
        currentXP = totalXp - 32000;
    } else if (totalXp >= 64000 && totalXp < 128000) {
        levelTitle = "veteran";
        currentLevel = 9;
        nextLevelRequiredXP = 128000 - currentXP;
        currentXP = totalXp - 64000;
    } else if (totalXp >= 128000 && totalXp < 256000) {
        levelTitle = "maester";
        currentLevel = 10;
        nextLevelRequiredXP = 256000 - currentXP;
        currentXP = totalXp - 128000;
    }
    // else if (totalXp >= 256000 && totalXp < 512000) {
    //     levelTitle = "maester";
    //     currentLevel = 10;
    //     nextLevelRequiredXP = 512000 - currentXP;
    //     currentXP = totalXp - 256000;
    // }
  
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
                {  $inc: { version: 1 }, $push: { "purchasedItems.tournaments": tId } },
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
    getfriendlistService,
}