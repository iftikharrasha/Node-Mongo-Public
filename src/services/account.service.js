const User = require("../models/user.model");
const Badge = require("../models/badge.model");
const UsersBadge = require("../models/usersbadge.model");
const GameAccount = require("../models/gameaccount.model");

const excludedUserFields = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v';
const excludedUserFieldsForFriendList = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v -balance -emailAddress -gameAccounts -mobileNumber -permissions -purchasedItems -status -parties -badgeRef';
const excludedGameAccountFields = '-version -uId -updatedAt -createdAt -__v';
const excludedPartyFields = '-version -owner -photo -coverPhoto -privacy -questions -members -tournaments -status -__v';

const userSignupService = async (data) => {
    const user = await User.create(data);
    return user;
};

const findUserByEmail = async (emailAddress) => {
    return await User.findOne({ emailAddress })
                    .populate({
                        path: 'gameAccounts',
                        select: excludedGameAccountFields,
                    })
                    .populate({
                        path: 'parties.owner',
                        select: excludedPartyFields,
                    })
};

const findUserById = async (id) => {
    return await User.findOne({ _id: id })
                    .populate({
                        path: 'gameAccounts',
                        select: excludedGameAccountFields,
                    })
                    .populate({
                        path: 'parties.owner',
                        select: excludedPartyFields,
                    })
};

const findUserByUsername = async (userName) => {
    return await User.findOne({ userName })
                    .select('_id');
};

const checkIfUserIsMutual = async (uid, userId) => {
    const user = await User.findOne({ _id: uid, 'requests.friend.mutuals': userId });
    return user;
};

const arraysHaveSameElements = (array1, array2) => {
    // Sort the arrays
    const sortedArray1 = array1.slice().sort();
    const sortedArray2 = array2.slice().sort();
    console.log(sortedArray1, sortedArray2)

    // Check if the sorted arrays have the same elements
    return JSON.stringify(sortedArray1) === JSON.stringify(sortedArray2);
}

const checkIfUserAlreadyBelongsToSimilarTeam = async (category, userId, platforms, crossPlatforms) => {
    const user = await User.findById(userId).populate('teams');
    const teams = user.teams || [];

    let teamExists = null;
    if(platforms.includes('cross')){
        teamExists = teams.find(t => t.category === category && arraysHaveSameElements(t.crossPlatforms, crossPlatforms));
        console.log('1', teamExists)
    }else{
        teamExists = teams.find(t => t.category === category && arraysHaveSameElements(t.platforms, platforms));
        console.log("2", teamExists)
    }

    // const teamExists = teams.some(team => team.category === cat );

    return teamExists;
};

const verifyTeamMemberAddService = async (uid, data) => {
    const verifiedMembers = [];
    const members = data.members;
    const category = data.category;
    const platforms = data.platforms;
    const crossPlatforms = data.crossPlatforms;

    for (const member of members) {
        const user = await findUserByUsername(member);
        if (user) {
            const friend = await checkIfUserIsMutual(uid, user._id);
            if (friend) {
                const alreadyInATeam = await checkIfUserAlreadyBelongsToSimilarTeam(category, user._id, platforms, crossPlatforms);
                if(alreadyInATeam){
                    return { success: false, message: `Player ${member} already belongs to a ${category} team`, members: verifiedMembers};
                }else{
                    verifiedMembers.push(user._id.toString());
                }
                // verifiedMembers.push(user._id.toString());
            } else {
                return { success: false, message: `Player '${member}' is not your friend`, members: verifiedMembers};
            }
        } else {
            return { success: false, message: `Player '${member}' does not exist`, members: verifiedMembers};
        }
    }

    return { success: true, message: 'Players are okay to invite', members: verifiedMembers};
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

const deleteGameAccountsService = async () => {
    const result = await GameAccount.deleteMany({});
    return result;
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

const addNewBadgeService = async (id, data) => {
    const badge = await Badge.create(data);
    return badge;
};

const getBadgeListService = async (id) => {
    // Step 1: Fetch site badges
    const siteBadges = await Badge.find({}).sort({createdAt: -1});
    
    // Step 2: Fetch user's unlocked badges
    const userBadges = await UsersBadge.find({ uId: id });

    // Step 3: Create a mapping of user badges based on badge _id
    const userBadgeMap = {};
    for (const userBadge of userBadges) {
      userBadgeMap[userBadge.badge.toString()] = userBadge;
    }

    // Step 4 and 5: Combine badge data
    const badges = siteBadges.map((siteBadge) => {
        const userBadge = userBadgeMap[siteBadge._id.toString()];
        if (userBadge) {
            return {
                ...siteBadge.toObject(),
                level: userBadge.level,
                claimed: userBadge.claimed,
                locked: userBadge.locked,
                registered: true,
            };
        } else {
            return {
                ...siteBadge.toObject(),
                level: 0, // Default level for locked/unclaimed badges
                claimed: false,
                locked: false,
                registered: false,
            };
        }
    });
    
    return badges
};

const updateSiteBadgeService = async (id, data) => {
    const currentBadge = await Badge.findById(id);

    const updatedBadge = {
        ...currentBadge.toObject(),
        ...data,
        version: currentBadge.version + 1 // increment the version field
    };

    const result = await Badge.findByIdAndUpdate({ _id: id }, updatedBadge, {
      new: true,
      runValidators: true
    });
    return result;
};

const addUsersBadgeService = async (uid, uName, slag) => {
    const badge = await Badge.findOne({slag: slag});
    let badgeFound = await UsersBadge.findOne({uId: uid, badge: badge._id});

    if(badgeFound){
        if (badgeFound.claimed) {
            //when user is claiming it
            const xpAdd = await updateXp(uid, badge.xp, badge.loots, badge.gems);

            if (badge.once) {
                if (!badgeFound.locked) {
                    badgeFound.locked = true;
                }
            } 
            
            badgeFound.claimed = false;
            badgeFound.level += 1;
            badgeFound.xpTotal += badge.xp;
            await badgeFound.save();

            badgeFound.myStats = xpAdd.data.stats;

            console.log("1. badgeFound with stats", xpAdd.data.stats)

            return { success: false, message: "Item already exists and claimed", badge: badgeFound, stats: xpAdd.data.stats};
        }else{
            //when user is renewing it
            if (!badge.locked && !badge.once) {
                badgeFound.claimed = true;
                await badgeFound.save();

                return { success: false, message: "Item already exists and renewed", badge: badgeFound, stats: null};
            } else{
                return { success: false, message: "Item already exists, locked and not possible to be renewed", badge: badgeFound, stats: null};
            }
        }
    }else{
        //newly claiming the badge
        const data = {
            uId: uid,
            uName: uName,
            badge: badge._id,
            xpTotal: badge.xp
        }
        const usersbadge = await UsersBadge.create(data);

        if(usersbadge){
            const result = await User.findOneAndUpdate(
                { _id: uid },
                {  $inc: { version: 1 }, $push: { "badgeRef": usersbadge._id } },
                { new: true }
            );
        }

        return { success: true, message: `Registered a new badge`, badge: usersbadge, stats: null};
    }
};

const updateXp = async (id, newXp, newLoots, newGems) => {
    const currentProfile = await User.findOne({ _id: id });
    const totalXp = currentProfile.stats.totalXp + newXp;
    let currentXP = currentProfile.stats.currentXP + newXp;
    let levelTitle = currentProfile.stats.levelTitle;
    let currentLevel = currentProfile.stats.currentLevel;
    let nextLevelRequiredXP = currentProfile.stats.nextLevelRequiredXP;
    let totalLoots = currentProfile.stats.totalLoots + newLoots;
    let totalGems = currentProfile.stats.totalGems + newGems;

    if (totalXp > 0 && totalXp < 500) {
        levelTitle = "Iron Shakled";
        currentLevel = 1;  
        nextLevelRequiredXP = 500 - currentXP;
        currentXP = totalXp - 0;
    } else if (totalXp >= 500 && totalXp < 2000) {
        levelTitle = "Broken Cuff";
        currentLevel = 2;  
        nextLevelRequiredXP = 2000 - currentXP;
        currentXP = totalXp - 500;
    } else if (totalXp >= 2000 && totalXp < 4000) {
        levelTitle = "Prison Breaker";
        currentLevel = 3;
        nextLevelRequiredXP = 4000 - currentXP;
        currentXP = totalXp - 2000;
    } else if (totalXp >= 4000 && totalXp < 8000) {
        levelTitle = "Shattered Sword";
        currentLevel = 4;
        nextLevelRequiredXP = 8000 - currentXP;
        currentXP = totalXp - 4000;
    } else if (totalXp >= 8000 && totalXp < 16000) {
        levelTitle = "Underdog";
        currentLevel = 5;
        nextLevelRequiredXP = 16000 - currentXP;
        currentXP = totalXp - 8000;
    } else if (totalXp >= 16000 && totalXp < 32000) {
        levelTitle = "Swiftdagger";
        currentLevel = 6;
        nextLevelRequiredXP = 32000 - currentXP;
        currentXP = totalXp - 16000;
    } else if (totalXp >= 32000 && totalXp < 64000) {
        levelTitle = "Liberty Blade";
        currentLevel = 7;
        nextLevelRequiredXP = 64000 - currentXP;
        currentXP = totalXp - 32000;
    } else if (totalXp >= 64000 && totalXp < 128000) {
        levelTitle = "Burning Sheild";
        currentLevel = 8;
        nextLevelRequiredXP = 128000 - currentXP;
        currentXP = totalXp - 64000;
    } else if (totalXp >= 128000 && totalXp < 256000) {
        levelTitle = "Thracian Helm";
        currentLevel = 9;
        nextLevelRequiredXP = 256000 - currentXP;
        currentXP = totalXp - 128000;
    } else if (totalXp >= 256000 && totalXp < 512000) {
        levelTitle = "Eternal Crest";
        currentLevel = 10;
        nextLevelRequiredXP = 512000 - currentXP;
        currentXP = totalXp - 256000;
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
        totalLoots,
        totalGems,
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
    
    return { success: true, message: `XP updated`, data: result};
};
  

const deleteProfileByIdService = async (id) => {
    const result = await User.findByIdAndDelete({ _id: id });
    return result;
};

const addPurchasedItemToUserService = async (tId, uId, feeType, joiningFee) => {
    const currentUser = await User.findOne({ _id: uId });

    if(currentUser){
        if (currentUser.purchasedItems.tournaments.indexOf(tId) !== -1) {
            return false
        } else {
            let updateFields = {};
            if (feeType === 'aquamarine') {
                updateFields = {
                    "stats.aquamarine": currentUser.stats.aquamarine - joiningFee,
                    "stats.totalGems": currentUser.stats.totalGems - joiningFee
                };
            } else if (feeType === 'tourmaline') {
                updateFields = {
                    "stats.tourmaline": currentUser.stats.tourmaline - joiningFee,
                    "stats.totalGems": currentUser.stats.totalGems - joiningFee
                };
            }

            const result = await User.findOneAndUpdate(
                { _id: currentUser._id },
                {  
                    $inc: { version: 1 }, 
                    $push: { "purchasedItems.tournaments": tId },
                    $set: updateFields
                },
                { new: true }
            );
            
            return result;
        }
    }else{
        return false
    }
};

const addPurchasedItemToTeamMembersService = async (tId, members) => {
    try {
        // Iterate over each member ObjectId
        for (const memberId of members) {
            // Find the user document and update the purchasedItems.tournaments array
            // await User.findByIdAndUpdate(memberId, {
            //     $addToSet: { 'purchasedItems.tournaments': tId }
            // });
            await User.findOneAndUpdate(
                { _id: memberId },
                { $addToSet: { 'purchasedItems.tournaments': tId } , $inc: { version: 1 }
            });
        }
        return { success: true, message: 'Tournament added to users purchasedItems' };
    } catch (error) {
        console.error('Error adding tournament to users purchasedItems:', error);
        return { success: false, message: 'Error adding tournament to users purchasedItems' };
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
    addPurchasedItemToTeamMembersService,
    getUsersListService,
    updateXp,
    addGameAccountService,
    deleteGameAccountsService,
    gameAccountConnectToUser,
    friendRequestService,
    getfriendlistService,
    addNewBadgeService,
    getBadgeListService,
    updateSiteBadgeService,
    addUsersBadgeService,
    verifyTeamMemberAddService
}