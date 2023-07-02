const Tournament = require('../models/tournament.model')
const Leaderboard = require('../models/leaderboard.model')

const excludedMasterFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';
const excludedUserFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -socials -updatedAt -__v';

const getAllTournamentsService = async () => {
    const tournaments = await Tournament.find({ status: 'active' })
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
    
    return tournaments;
}

const getTournamentDetailsService = async (id) => {
    const tournament = await Tournament.findOne({ _id: id })
                                       .populate('masterProfile', excludedMasterFields)
    return tournament;
}

const getLeaderboardsService = async (id) => {
    const leaderboard = await Leaderboard.findOne({ tId: id })
                                        .populate({
                                            path: 'leaderboards',
                                            select: excludedUserFields,
                                            match: { status: { $ne: 'blocked' } } //we get users who are not blocked
                                        });
    return leaderboard;
}

const getCredentialsService = async (id) => {
    const tournament = await Tournament.findOne({ _id: id })
    const credentials = tournament.credentials;
    return credentials;
}

const createTournamentService = async (data) => {
    const tournament = await Tournament.create(data);
    const populatedTournament = await getTournamentDetailsService(tournament._id);
    return populatedTournament;
}

const updateTournamentByIdService = async (id, data) => {
    const currentTournament = await Tournament.findById(id);

    const updatedTournament = {
        ...currentTournament.toObject(),
        ...data,
        version: currentTournament.version + 1 // increment the version field
    };

    const tournament = await Tournament.findOneAndUpdate({ _id: id }, updatedTournament, {
      new: true,
      runValidators: false
    });

    
    const populatedTournament = await getTournamentDetailsService(tournament._id);
    return populatedTournament;
}

const addUserToTournamentObjectLeaderboard = async (tId, uId) => {
    //pushing user id inside the tournament leaderboard
    const currentTournament = await Tournament.findOne({ _id: tId });

    if(currentTournament){
        if (currentTournament.leaderboards.indexOf(uId) !== -1) {
            return false
        } else {
            const result = await Tournament.findOneAndUpdate(
                { _id: currentTournament._id },
                {  $push: { "leaderboards": uId } },
                { new: true }
            );
            
            // console.log(result);
            return result;
        }
    }else{
        return false
    }
}

const deleteTournamentByIdService = async (id) => {
    const result = await Tournament.findByIdAndDelete({ _id: id });
    return result;
};

const deleteTournamentLeaderboardByIdService = async (id) => {
    const result = await Leaderboard.deleteOne({ tId: id });
    return result;
};

const addUserToLeaderboardService = async (tId, uId) => {
    //pushing user id inside separate leaderboard
    const currentLeaderboard = await Leaderboard.findOne({ tId: tId });
    // console.log("currentLeaderboard", currentLeaderboard)

    if (currentLeaderboard.leaderboards.indexOf(uId) !== -1) {
        return false
    } else {
        const result = await Leaderboard.findOneAndUpdate(
            { _id: currentLeaderboard._id },
            { $push: { leaderboards: { $each: [uId], $position: 0 } }, $inc: { version: 1 } },
            { new: true }
        );
        // console.log("result", result)
        
        return result;
    }
};

//master
const getAllMasterTournamentsService = async (id) => {
    const tournaments = await Tournament.find({ 'masterProfile': id }) 
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
    
    return tournaments;
}

const addTournamentThumbnailService = async (id, url) => {
    const result = await Tournament.findOneAndUpdate({ _id: id }, {tournamentThumbnail: url}, {
        new: true,
        runValidators: false
    });
    return result;
}

//internal
const getAllInternalTournamentsService = async (id) => {
    const tournaments = await Tournament.find({}) 
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
    
    return tournaments;
}

module.exports = {
    createTournamentService,
    getAllTournamentsService,
    getTournamentDetailsService,
    updateTournamentByIdService,
    deleteTournamentByIdService,
    deleteTournamentLeaderboardByIdService,
    getLeaderboardsService,
    getCredentialsService,
    addUserToLeaderboardService,
    getAllMasterTournamentsService,
    getAllInternalTournamentsService,
    addUserToTournamentObjectLeaderboard,
    addTournamentThumbnailService
}

//check if user already registered?
//leaderboard version table
//what if user changed his profile pic, will version table be changed?
// when user registeres to the tournament that tournament needs to go inside purchaseItem of user