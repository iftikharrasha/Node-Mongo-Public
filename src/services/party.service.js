const Party = require('../models/party.model');
const Answer = require('../models/answer.model');
const User = require('../models/user.model')
const Tournament = require('../models/tournament.model');
const excludedMasterFields = '-firstName -lastName -requests -parties -purchasedItems -gender -emailAddress -emailVerified -mobileNumber -aboutMe -gameAccounts -badgeRef -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';

const getAllPartiesService = async () => {
    const parties = await Party.find({ status: 'active' })
                                .populate('owner', excludedMasterFields);
    return parties;
}

// const getMyTeamsByIdService = async (id) => {
//     const topup = await Party.find({ captainId: id });
//     return topup;
// }

const getPartyDetailsService = async (id) => {
    const party = await Party.findOne({ _id: id })
                             .populate('owner', excludedMasterFields); 
    return party;
}

const getPartyEventsByIdService = async (id) => {
    const parties = await Tournament.find({ party: id });
    return parties;
}

const createPartyService = async (data) => {
    const party = await Party.create(data);
    return party;
}

const addPartyToUserService = async (uId, partyId) => {
    //pushing tournament id inside the user
    const currentUser = await User.findOne({ _id: uId });

    if(currentUser){
        if (currentUser.parties.owner.indexOf(partyId) !== -1) {
            return false
        } else {
            const result = await User.findOneAndUpdate(
                { _id: currentUser._id },
                {  $inc: { version: 1 }, $push: { "parties.owner": partyId } },
                { new: true }
            );
            
            return result;
        }
    }else{
        return false
    }
};

const addPartyAnswer = async (data) => {
    const answer = await Answer.create(data);
    return answer;
}

const answerConnectToPartyService = async (partyId, answerId, uId) => {
    //pushing user id inside the tournament leaderboard
    const currentParty = await Party.findOne({ _id: partyId });
    console.log(uId, answerId, currentParty)

    if(currentParty){
        const result = await Party.findOneAndUpdate(
            { _id: currentParty._id },
            {  $inc: { version: 1 }, $push: { "answers": answerId, "members.requested": uId } },
            { new: true }
        );
        
        return result;
    }else{
        return false
    }
}

const getPartyPeoplelistService = async (id) => {
    const currentProfile = await Party.findOne({ _id: id })
                                .select('members.joined members.requested members.invited')
                                .populate({
                                    path: 'members.joined members.requested members.invited',
                                    select: excludedMasterFields,
                                });
    
    return currentProfile
};

module.exports = {
    // getMyTeamsByIdService,
    getAllPartiesService,
    createPartyService,
    getPartyDetailsService,
    addPartyToUserService,
    getPartyEventsByIdService,
    addPartyAnswer,
    answerConnectToPartyService,
    getPartyPeoplelistService
}