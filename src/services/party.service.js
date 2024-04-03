const Party = require('../models/party.model');
const PartySocial = require('../models/partysocial.model');
const PartyComment = require('../models/partyComment.model');
const Answer = require('../models/answer.model');
const User = require('../models/user.model')
const Tournament = require('../models/tournament.model');
const excludedMasterFields = '-firstName -lastName -requests -parties -purchasedItems -gender -emailAddress -emailVerified -mobileNumber -aboutMe -gameAccounts -badgeRef -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';

const getAllPartiesService = async () => {
    const parties = await Party.find({ status: 'active' })
                                .populate('owner', excludedMasterFields);
    return parties;
}

const getPartyDetailsService = async (id, uId) => {
    const party = await Party.findOne({ _id: id })
                             .populate('owner', excludedMasterFields)
                             .lean(); 
    
    // Check if author is the owner of the party
    const isOwner = party.owner._id.toString() === uId;

    // Check if author is joined in the party members
    const isJoined = party.members.joined.some(member => member._id.toString() === uId);

    // party.isOwner = isOwner;
    // party.isJoined = isJoined;
    party.unlocked = isOwner || isJoined;

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
    //pushing party id inside the user
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

//master
const controlRequestToJoinPartyService = async (partyId, uId, type) => {
    console.log(partyId, uId, type);
    let updateQuery = {};
    if (type === 'approve') {
        updateQuery = {  $inc: { version: 1 }, $push: { "members.joined": uId }, $pull: { "members.requested": uId } };
    } else if (type === 'reject') {
        updateQuery = {  $inc: { version: 1 }, $pull: { "members.requested": uId } };
    }

    const result = await Party.findOneAndUpdate(
        { _id: partyId },
        updateQuery,
        { new: true }
    );
    console.log(result)
    
    return result;
}

// const getPartyPeoplelistService = async (id) => { 
//     const currentProfile = await Party.findOne({ _id: id })
//                                 .select('members.joined members.requested members.invited')
//                                 .populate({
//                                     path: 'members.joined members.requested members.invited',
//                                     select: excludedMasterFields,
//                                 });
    
//     return currentProfile
// };

const getPartyPeoplelistService = async (id) => { 
    const currentProfile = await Party.findOne({ _id: id })
                                .select('title questions answers members.joined members.requested members.invited')
                                .populate({
                                    path: 'answers members.joined members.requested members.invited',
                                    select: excludedMasterFields,
                                });
    
    return currentProfile
};

const addPostToPartyService = async (pId, data) => {
    const partySocial = await PartySocial.findOneAndUpdate(
        { party: pId },
        { $inc: { version: 1 }, $push: { 'posts': data } },
        { new: true }
    );

    const lastPost = partySocial.posts[partySocial.posts.length - 1];

    const partyComment = new PartyComment({
        partySocial: lastPost._id,
        party: partySocial.party,
    });
    await partyComment.save();

    return partySocial;
};

const getPartySocialsByIdService = async (id) => {
    const partySocial = await PartySocial.findOne({ party: id }).populate('posts.author', excludedMasterFields);

    if (!partySocial) {
        return null;
    }

    partySocial.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return partySocial;
}

const addCommentToPartyPostService = async (pId, postId, data) => {
    const partyComment = await PartyComment.findOneAndUpdate(
        { party: pId, partySocial: postId },
        { $inc: { version: 1 }, $push: { 'comments': data } },
        { new: true }
    );

    return partyComment;
};

const addReactToPartyPostService = async (pId, postId, data) => {
    const { from, type, to } = data;

    try {
        let updateQuery = {};
        if (type === '+') {
            updateQuery = { 
                $push: { 'posts.$.reacts.likes': from }, 
                $pull: { 'posts.$.reacts.dislikes': from } 
            };
            // updateQuery = { $addToSet: { 'posts.$.reacts.likes': from }, $pull: { 'posts.$.reacts.dislikes': from } }; //clear the array
        } else if (type === '-') {
            updateQuery = { 
                $push: { 'posts.$.reacts.dislikes': from }, 
                $pull: { 'posts.$.reacts.likes': from } 
            };
            // updateQuery = { $addToSet: { 'posts.$.reacts.dislikes': from }, $pull: { 'posts.$.reacts.likes': from } }; //clear the array
        }

        try {
            const result = await PartySocial.findOneAndUpdate(
                { 
                  'party': pId, 
                  'posts._id': postId 
                },
                updateQuery,
                { 
                  new: true 
                }
            );

            if (result) {
                console.log(`Successfully updated reaction for post ${postId} in PartySocial ${pId}`);
            } else {
                console.log(`Failed to update reaction for post ${postId} in PartySocial ${pId}`);
            }
            return { success: true, message: type === '+' ? 'liked' : 'disliked' };
        } catch (error) {
            console.error('Error adding react to party post:', error);
            return { success: false, message: 'An error occurred while adding react to party post.' };
        }
    } catch (error) {
        console.error('Error adding react to party post:', error);
        return { success: false, message: 'An error occurred' };
    }
};


const getPartySocialsCommentsByIdService = async (pId, postId) => {
    const partySocial = await PartyComment.find({ party: pId, partySocial: postId })
                                .populate('comments.author comments.mentioned', excludedMasterFields)
                                .sort({ createdAt: -1 });
    return partySocial;
}

// const addPartyPostThumbnailService = async (id, url) => {
//     const result = await PartySocial.findOneAndUpdate({ party: id }, {tournamentThumbnail: url}, {
//         new: true,
//         runValidators: false
//     });
//     return result;
// }

module.exports = {
    // getMyTeamsByIdService,
    getAllPartiesService,
    createPartyService,
    getPartyDetailsService,
    addPartyToUserService,
    getPartyEventsByIdService,
    addPartyAnswer,
    answerConnectToPartyService,
    getPartyPeoplelistService,
    addPostToPartyService,
    getPartySocialsByIdService,
    addCommentToPartyPostService,
    addReactToPartyPostService,
    getPartySocialsCommentsByIdService,
    controlRequestToJoinPartyService,
    // addPartyPostThumbnailService
}