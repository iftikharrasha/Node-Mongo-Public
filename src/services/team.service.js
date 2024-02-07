const { getDb } = require("../utils/dbConnect")
const Team = require('../models/team.model');
const User = require('../models/user.model');
const excludedUserFieldsForFriendList = '-firstName -lastName -password -dateofBirth -version -address -teams -requests -socials -updatedAt -__v -balance -emailAddress -gameAccounts -mobileNumber -permissions -purchasedItems -status -parties -badgeRef';

const getAllTeamsService = async () => {
    const db = getDb();
    const teams = await db.collection("teams").find({}).toArray();
    return teams;
}

const getMyTeamsByIdService = async (id) => {
    const team = await Team.find({ captainId: id })
                            .populate('members.invited', excludedUserFieldsForFriendList)
                            .populate('captainId', excludedUserFieldsForFriendList);
    return team;
}

const getTeamDetailsService = async (id) => {
    const team = await Team.findOne({ _id: id })
                                       .populate('members.invited', excludedUserFieldsForFriendList)
                                       .populate('captainId', excludedUserFieldsForFriendList)
                                       .lean();
                  
    return team;
}

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

module.exports = {
    getAllTeamsService,
    getMyTeamsByIdService,
    createTeamService,
    addTeamToUserService
}