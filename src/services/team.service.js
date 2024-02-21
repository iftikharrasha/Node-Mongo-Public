const { getDb } = require("../utils/dbConnect")
const Team = require('../models/team.model');
const User = require('../models/user.model');
const excludedUserFieldsForTeamList = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -socials -updatedAt -__v -balance -emailAddress -mobileNumber -permissions -purchasedItems -status -parties -badgeRef';

const getAllTeamsService = async () => {
    const teams = await Team.find({ status: 'active' })
                            .populate('members.invited members.mates', `${excludedUserFieldsForTeamList} -gameAccounts`)
                            .populate('captainId', `${excludedUserFieldsForTeamList} -gameAccounts`);
    return teams;
}

const getMyTeamsByIdService = async (id) => {
    const team = await Team.find({
                                $or: [
                                    { captainId: id },  // Check if the provided id matches captainId
                                    { 'members.mates': id }  // Check if the provided id exists in members.mates array
                                ]
                            })
                            .populate('members.invited members.mates', `${excludedUserFieldsForTeamList} -gameAccounts`)
                            .populate('captainId', `${excludedUserFieldsForTeamList} -gameAccounts`);
    return team;
}

const getTeamDetailsService = async (id) => {
    // const accountTag = 'activision';
    // const category = 'warzone';
    // const platform = 'pc''; //optional? need to make sure 1 person 1 gameaccount for 1 game

    // Define the populate options for captainId
    const captainPopulateOptions = {
        path: 'captainId',
        select: excludedUserFieldsForTeamList,
        populate: {
            path: 'gameAccounts',
            // match: { tag: accountTag, category: category, platform: platform },
            // select: 'tag' // Select only the tag field from the gameAccounts collection
        }
    };

    // Define populate options for members.mates
    const matesPopulateOptions = {
        path: 'members.mates',
        select: excludedUserFieldsForTeamList,
        populate: {
            path: 'gameAccounts',
            // match: { tag: accountTag, category: category, platform: platform },
        }
    };

    // Define populate options for members.invited
    const invitedPopulateOptions = {
       path: 'members.invited',
       select: `${excludedUserFieldsForTeamList} -gameAccounts`,
    };

     // Find the team and populate the captainId field with the specified options
     const team = await Team.findOne({ _id: id })
                            .populate(invitedPopulateOptions)
                            .populate(matesPopulateOptions)
                            .populate(captainPopulateOptions)
                            .lean();

    ////normal way
    // const team = await Team.findOne({ _id: id })
    //                                    .populate('members.invited members.mates', excludedUserFieldsForTeamList)
    //                                    .populate('captainId', excludedUserFieldsForTeamList)
    //                                    .lean();
    

    // Manually add the team total xp points to tournament object
    const teamMatesTotalXp = team?.members?.mates?.reduce((acc, member) => acc + member.stats.totalXp, 0);
    const teamTotalXpPoints = teamMatesTotalXp + team.captainId.stats.totalXp;
    team.teamTotalXp = teamTotalXpPoints;

     // Count total gameAccounts from team members and captain
    const totalGameAccounts = team.members.mates.reduce((acc, member) => acc + (member.gameAccounts || []).length, 0) +
    (team.captainId.gameAccounts || []).length;
    team.totalGameAccounts = totalGameAccounts;
                  
    return team;
}

const updateTeamByIdService = async (id) => {
    try {
        const updatedTeam = await Team.findByIdAndUpdate(id, { status: 'active' }, { new: true });
            console.log(updatedTeam);
        return updatedTeam;
    } catch (error) {
        console.error('Error activating team:', error);
        throw error; // Forward the error to the caller
    }
};


// const updateTeamByIdService = async (id, data) => {
//     const currentTeam = await Team.findById(id);

//     const updatedProfile = {
//         ...currentTeam.toObject(),
//         status: 'active',
//         version: currentTeam.version + 1 // increment the version field
//     };

//     const result = await Team.findByIdAndUpdate(
//         mongoose.Types.ObjectId(id), // Convert id to ObjectId
//         updatedProfile,
//         {
//             new: true,
//             runValidators: true
//         }
//     );
//     console.log(result);
//     return result;
// };

const createTeamService = async (data) => {
    const team = await Team.create(data);
    const populatedTeam = await getTeamDetailsService(team._id);
    return populatedTeam;
}

const addTeamToUserService = async (uId, teamId) => {
    //pushing team id inside the user
    const currentUser = await User.findOne({ _id: uId });

    if(currentUser){
        if (currentUser.teams.indexOf(teamId) !== -1) {
            return false
        } else {
            const result = await User.findOneAndUpdate(
                { _id: currentUser._id },
                {  $inc: { version: 1 }, $push: { "teams": teamId } },
                { new: true }
            );
            
            return result;
        }
    }else{
        return false
    }
};

const getTeamPeoplelistService = async (id) => {
    const accountTag = 'activision';
    const category = 'warzone';
    const platform = 'pc'; //optional? need to make sure 1 person 1 gameaccount for 1 game

    // Define the populate options for captainId
    const captainPopulateOptions = {
        path: 'captainId',
        select: excludedUserFieldsForTeamList,
        populate: {
            path: 'gameAccounts',
            match: { tag: accountTag, category: category, platform: platform },
            // select: 'tag' // Select only the tag field from the gameAccounts collection
        }
    };

    // Define populate options for members.mates
    const matesPopulateOptions = {
        path: 'members.mates',
        select: `${excludedUserFieldsForTeamList}`,
        populate: {
            path: 'gameAccounts',
            match: { tag: accountTag, category: category, platform: platform },
        }
    };

    // Define populate options for members.invited
    const invitedPopulateOptions = {
       path: 'members.invited',
       select: `${excludedUserFieldsForTeamList} -gameAccounts`,
    };

    // Find the team and populate the captainId field with the specified options
    const currentTeam = await Team.findOne({ _id: id })
                        .populate(invitedPopulateOptions)
                        .populate(matesPopulateOptions)
                        .populate(captainPopulateOptions)
                        .lean();

    // const currentTeam = await Team.findOne({ _id: id })
    //                             .select('members.invited members.mates')
    //                             .populate({
    //                                 path: 'members.invited members.mates',
    //                                 select: excludedUserFieldsForTeamList,
    //                             });
    
    return currentTeam
};


const teamJoinRequestService = async (data) => {
    const { from, to, type } = data;
  
    // Update based on the request type
    switch (type) {
        // case 'friend_request_send':
        //     // Update the sender's 'friend.sent'
        //     await User.findOneAndUpdate(
        //         { _id: from },
        //         { $inc: { version: 1 }, $push: { 'requests.friend.sent': to } }
        //     );

        //     // Update the receiver's 'friend.pending'
        //     await User.findOneAndUpdate(
        //         { _id: to },
        //         { $inc: { version: 1 }, $push: { 'requests.friend.pending': from } }
        //     );
            
        //     return { success: true, message: `You've sent a friend request`, xp: true };
  
        case 'invite_request_accept':
            await Team.findOneAndUpdate(
              { _id: to },
              { $inc: { version: 1, friends: 1 }, 
                $push: { 'members.mates': from },
                $pull: { 'members.invited': from } 
              }
            );

            const addtoUser = await addTeamToUserService(from, to);
            console.log(addtoUser)
      
            return { success: true, message: `You've joined a new team`, xp: true };
  
        // case 'friend_request_reject':
        //     // Remove the request from the sender's 'friend.sent'
        //     await User.findOneAndUpdate(
        //         { _id: to },
        //         { $inc: { version: 1 }, $pull: { 'requests.friend.sent': from } }
        //     );
        //     // Remove the request from the receiver's 'friend.pending'
        //     await User.findOneAndUpdate(
        //         { _id: from },
        //         { $inc: { version: 1 }, $pull: { 'requests.friend.pending': to } }
        //     );
        //     return { success: true, message: `You've rejected the friend request`, xp: false };
        
        // case 'friend_request_unfriend':
        //     // Remove from as a mutual friend of to
        //     await User.findOneAndUpdate(
        //         { _id: to },
        //         { $inc: { version: 1 }, $pull: { 'requests.friend.mutuals': from } }
        //     );
        //     // Remove to as a mutual friend of from
        //     await User.findOneAndUpdate(
        //         { _id: from },
        //         { $inc: { version: 1 }, $pull: { 'requests.friend.mutuals': to } }
        //     );
        //     return { success: true, message: `You succesfully unfirend the person`, xp: false };
  
        default:
            return { success: false, message: 'Invalid request type', xp: false };
    }
};

module.exports = {
    getAllTeamsService,
    getTeamDetailsService,
    updateTeamByIdService,
    getMyTeamsByIdService,
    createTeamService,
    addTeamToUserService,
    getTeamPeoplelistService,
    teamJoinRequestService
}