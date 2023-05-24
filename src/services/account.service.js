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
}

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
    getUsersListService
}