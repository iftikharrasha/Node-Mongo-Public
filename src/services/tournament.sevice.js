const Tournament = require('../models/tournament.model')
const Leaderboard = require('../models/leaderboard.model')

const excludedMasterFields = '-firstName -lastName -status -balance -password -dateofBirth -version -permissions -address -teams -requests -stats -socials -updatedAt -__v';
const excludedUserFields = '-firstName -lastName -status -balance -password -dateofBirth -version -permissions -address -teams -requests -stats -socials -updatedAt -__v';

const getAllTournamentsService = async () => {
    const tournaments = await Tournament.find({}).populate('masterProfile', excludedFields);
    return tournaments;
}

const getTournamentDetailsService = async (id) => {
    const tournament = await Tournament.findOne({ _id: id })
                                       .populate('masterProfile', excludedMasterFields)
                                    //    .populate('leaderboards', excludedUserFields); 
                                    //uncomment this if we want to inject leaderboards inside tournaments
    return tournament;
}

const getLeaderboardsService = async (id) => {
    const leaderboard = await Leaderboard.findOne({ tId: id })
                                         .populate('leaderboards', excludedUserFields);
    return leaderboard;
}

const createTournamentService = async (data) => {
    const tournament = await Tournament.create(data);
    return tournament;
}

const updateTournamentByIdService = async (id, data) => {
    const currentTournament = await Tournament.findById(id);

    const updatedTournament = {
        ...currentTournament.toObject(),
        ...data,
        version: currentTournament.version + 1 // increment the version field
    };

    const result = await Tournament.findByIdAndUpdate({ _id: id }, updatedTournament, {
      new: true,
      runValidators: false
    });
    return result;
}

const deleteTournamentByIdService = async (id) => {
    const result = await Tournament.findByIdAndDelete({ _id: id });
    return result;
};

const tournamentRegistrationService = async (tId, uId) => {
    //creating user id inside tournament leaderboard
    const tournament = await Tournament.findByIdAndUpdate(
        { _id: tId },
        { $push: { leaderboards: { $each: [uId], $position: 0 } } },
        { new: true }
    );

    //pushing user id inside separate leaderboard
    const leaderboard = await Leaderboard.findOne({ tId: tId });
    const result = await Leaderboard.findByIdAndUpdate(
        { _id: leaderboard._id },
        { $push: { leaderboards: { $each: [uId], $position: 0 } } },
        { new: true }
    );
    return result;
}

module.exports = {
    createTournamentService,
    getAllTournamentsService,
    getTournamentDetailsService,
    updateTournamentByIdService,
    deleteTournamentByIdService,
    getLeaderboardsService,
    tournamentRegistrationService,
}

//check if user already registered?
//leaderboard version table
//what if user changed his profile pic, will version table be changed?