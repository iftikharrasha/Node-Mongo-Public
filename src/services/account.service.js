const User = require("../models/user.model");

const excludedUserFields = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -stats -socials -updatedAt -__v';

const userSignupService = async (data) => {
    const user = await User.create(data);
    return user;
};

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
    updateXp
}