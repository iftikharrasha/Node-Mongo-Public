const Party = require('../models/party.model');
const excludedMasterFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';

const getAllPartiesService = async () => {
    const parties = await Party.find({ status: 'active' })
                                .populate('owner', excludedMasterFields);
    return parties;
}

// const getMyTeamsByIdService = async (id) => {
//     const topup = await Party.find({ captainId: id });
//     return topup;
// }

const createPartyService = async (data) => {
    const party = await Party.create(data);
    return party;
}

module.exports = {
    // getMyTeamsByIdService,
    getAllPartiesService,
    createPartyService,
}