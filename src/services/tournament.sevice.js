const Tournament = require('../models/tournament.model')
const Leaderboard = require('../models/leaderboard.model')
const Bracket = require('../models/bracket.model')
const User = require('../models/user.model')
const moment = require('moment');

const excludedMasterFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';
const excludedUserFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -socials -updatedAt -__v';

const getAllTournamentsService = async () => {
    const tournaments = await Tournament.find({ status: 'active' })
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
                                        .lean(); // Make sure to use 'lean()' to enable virtuals

    // Manually add the tournamentStatus to each tournament object
    const tournamentsWithStatus = tournaments.map(tournament => {
        return {
            ...tournament,
            tournamentStage: calculateTournamentStatus(tournament.dates),
        };
      });
    
      return tournamentsWithStatus;
}

const getAllTournamentsFilteredService = async (query) => {
    const tournaments = await Tournament.find(query)
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
                                        .lean(); // Make sure to use 'lean()' to enable virtuals

    // Manually add the tournamentStatus to each tournament object
    const tournamentsWithStatus = tournaments.map(tournament => {
        return {
            ...tournament,
            tournamentStage: calculateTournamentStatus(tournament.dates),
        };
      });
    
      return tournamentsWithStatus;
}

// Helper function to calculate the tournament status based on dates
const calculateTournamentStatus = (dates) => {
    const currentDate = new Date();

    if (currentDate >= dates.registrationStart && currentDate < dates.registrationEnd) {
        return 1; // Registration in progress
    } else if (currentDate >= dates.registrationEnd && currentDate < dates.tournamentStart) {
        return 2; // Lineup in progress
    } else if (currentDate >= dates.tournamentStart && currentDate < dates.tournamentEnd) {
        return 3; // Tournament in progress
    } else if (currentDate >= dates.tournamentEnd) {
        return 4; // Tournament finished
    }else{
        return 0;
    }
}

const getTournamentDetailsService = async (id) => {
    const tournament = await Tournament.findOne({ _id: id })
                                       .populate('masterProfile', excludedMasterFields)
                                       .lean();
                  
    // Manually add the tournamentStatus to the response
    tournament.tournamentStatus = tournament.dates.tournamentStatus;
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

const getBracketService = async (id) => {
    const bracket = await Bracket.findOne({ tId: id });
    return bracket;
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

const deleteTournamentBracketByIdService = async (id) => {
    const result = await Bracket.deleteOne({ tId: id });
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

const bookUserToBracketSlotService = async (tId, uId) => {
    try {
        const bracket = await Bracket.findOne({ tId: tId });
        const matches = bracket.matches;

        // Get the matches of the first round
        const firstRoundMatches = matches.filter(
            (match) => match.tournamentRoundText === "1"
        );
        
        // Shuffle the array of matches to randomly select a match for the user
        const selectedMatch = getRandomMatchWithVacancy(firstRoundMatches);

        if (selectedMatch) {
            const user = await User.findOne({ _id: uId });
            const convertedToParticipant = {
                id: user._id,
                resultText: null,
                isWinner: false,
                status: null,
                name: user.userName,
                picture: user.photo
            }

            // Create a deep copy of the selectedMatch to avoid mutation
            const modifiedMatch = JSON.parse(JSON.stringify(selectedMatch));

            // Add the new participant to the copied match
            modifiedMatch.participants.push(convertedToParticipant);
            
            // Save/update the new entry to the Bracket model
            const updatedBracket = await Bracket.findOneAndUpdate(
                { tId: tId, 'matches.id': selectedMatch.id },
                    { $set: { 
                        'matches.$': modifiedMatch,
                        version: bracket.version + 1,
                    } 
                },
                { new: true }
            );

            return modifiedMatch;
        }

        return false;
    } catch (error) {
        console.log(error);
    }
};

const getRandomMatchWithVacancy = (array) => {
    const availableMatches = array.filter((match) => match.participants.length < 2);
    return availableMatches.length > 0 ? availableMatches[Math.floor(Math.random() * availableMatches.length)] : null;
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

const updateTournamentApprovalService = async (id, data) => {
    const currentTournament = await Tournament.findById(id);
    let updatedTournament = data;

    if(currentTournament.settings.competitionMode === 'knockout'){
        const updatedSettings = await calculateRoundAndMatches(updatedTournament)
        if(currentTournament.bracket.length === 0){
            const generatedBracket = await bracketGernerate(currentTournament.dates.tournamentStart, currentTournament.settings.maxParticipitant)
            const result = await bracketEntryService(currentTournament, generatedBracket)
            
            const firstMatch = generatedBracket[currentTournament?.settings?.currentMatchId-1];
            const finalMatch = generatedBracket[currentTournament?.settings?.maxParticipitant-2];
            const updatedDates = await calculateDatesFromBrackets(updatedTournament, firstMatch, finalMatch)

            updatedTournament = {
                ...currentTournament.toObject(),
                ...data,
                status: "active",
                version: currentTournament.version + 1, 
                settings: updatedSettings,
                dates: updatedDates,
                bracket:  currentTournament._id
            };
        }else{
            updatedTournament = {
                ...currentTournament.toObject(),
                ...data,
                status: "active",
                version: currentTournament.version + 1, 
                settings: updatedSettings,
            };
        }
    }else{
        updatedTournament = {
            ...currentTournament.toObject(),
            ...data,
            status: "active",
            version: currentTournament.version + 1, 
        };
    }

    const tournament = await Tournament.findOneAndUpdate({ _id: id }, updatedTournament, {
      new: true,
      runValidators: false
    });
    
    const populatedTournament = await getTournamentDetailsService(tournament._id);
    return populatedTournament;
}

const bracketGernerate = async (tournamentStart, particaipants) => {
    const bracket = [];
    let rp = particaipants;
    const totalMatch = particaipants - 1;
    const rounds = Math.log2(particaipants);
    let offset = particaipants/2;
    let matchId = 0;

    // const date = new Date();
    const start = moment(tournamentStart);
  
    for(let j = 1; j <= rounds; j++) {
      for (let i = 1; i <= (rp/2); i++) {
        const nextMatchId = i > (rp/2) ? null :
                            i % 2 === 0 ?
                            (offset) : (offset+1);
                      
        
        matchId = matchId + 1;
        const match = {
          id: matchId,
          nextMatchId: rp === 2 || i === totalMatch ? null : nextMatchId,
          name: rp === 2 || i === totalMatch ? `Final Match` : `Round ${j} - Match ${i}`,
          tournamentRoundText: `${j}`,
          startTime: matchId === 1 ? `${start.format('llll')}` : `${start.add(2, 'hours').format('llll')}`, 
          state: 'SCHEDULED',
          participants: [],
        };
        offset = nextMatchId;
        bracket.push(match);
      }
      rp = rp/2;
    }
  
    return bracket;
};

const calculateRoundAndMatches = async (data) => {
    const settings = data.settings;
    const maxParticipitant = settings.maxParticipitant;
    settings.rounds = Math.log2(maxParticipitant);
    settings.matches = maxParticipitant - 1;

    return settings;
};

const calculateDatesFromBrackets = async (data, first, final) => {
    const dates = data.dates;
    dates.tournamentStart = first.startTime;
    dates.tournamentEnd = final.startTime;

    return dates;
};

const bracketEntryService = async (tournament, bracketData) => {
    try {
        const bracket = new Bracket({ 
            tId: tournament._id, 
            tName: tournament.tournamentName,
            matches: bracketData
        });
        await bracket.save();

        return bracket;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    createTournamentService,
    getAllTournamentsService,
    getAllTournamentsFilteredService,
    getTournamentDetailsService,
    updateTournamentByIdService,
    deleteTournamentByIdService,
    updateTournamentApprovalService,
    deleteTournamentLeaderboardByIdService,
    getLeaderboardsService,
    getBracketService,
    getCredentialsService,
    addUserToLeaderboardService,
    getAllMasterTournamentsService,
    getAllInternalTournamentsService,
    addUserToTournamentObjectLeaderboard,
    addTournamentThumbnailService,
    bookUserToBracketSlotService,
    deleteTournamentBracketByIdService
}

//check if user already registered?
//leaderboard version table
//what if user changed his profile pic, will version table be changed?
// when user registeres to the tournament that tournament needs to go inside purchaseItem of user
//send tournament status 1 2 3