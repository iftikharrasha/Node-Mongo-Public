const Tournament = require('../models/tournament.model')
const Leaderboard = require('../models/leaderboard.model')
const Bracket = require('../models/bracket.model')
const User = require('../models/user.model')
const moment = require('moment');
const mongoose = require("mongoose");

const excludedMasterFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -stats -socials -updatedAt -__v';
const excludedUserFields = '-firstName -lastName -balance -password -dateofBirth -version -permissions -address -teams -socials -updatedAt -__v';
const excludedGameAccountFields = '-version -uId -updatedAt -createdAt -__v';

const getAllTournamentsService = async () => {
    const tournaments = await Tournament.find({ status: 'active' })
                                        .sort({createdAt: -1})
                                        .populate('masterProfile', excludedMasterFields)
                                        // .populate('results', excludedMasterFields)
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

//3. PREVIOUSONE
// const getLeaderboardsService = async (id) => {
//     const leaderboard = await Leaderboard.findOne({ tId: id })
//                                         .populate({
//                                             path: 'leaderboards',
//                                             select: excludedUserFields,
//                                             match: { status: { $ne: 'blocked' } } //we get users who are not blocked
//                                         });
//     return leaderboard;
// }

const getLeaderboardsService = async (id) => {
    const leaderboard = await Leaderboard.findOne({ tId: id })
                                        .populate({
                                            path: 'leaderboards.gamer',
                                            select: excludedUserFields,
                                            match: { status: { $ne: 'blocked' } } //we get users who are not blocked
                                        })
                                        .populate({
                                            path: 'leaderboards.gameAccount', // Populate the 'gameAccount' field within the 'leaderboards' array
                                            select: excludedGameAccountFields
                                        })
                                        .lean(); // Use 'lean' to convert the result to a plain JavaScript object;
    return leaderboard;
}

const getTournamentResultService = async (id) => {
    const result = await Tournament.findOne({ _id: id })
                                    .select('results')
                                    .populate({
                                        path: 'results',
                                        select: excludedUserFields,
                                    });
    return result;
}

const getBracketService = async (id) => {
    const bracket = await Bracket.findOne({ tId: id });
    return bracket;
}

const getCredentialsService = async (tId, uId) => {
    const tournament = await Tournament.findOne({ _id: tId })
    let credentials = {}

    if(tournament.settings.competitionMode === "knockout"){
       credentials = await getCurrentMatchCredentials(tId, uId, tournament.settings.currentMatchId, credentials)
    }else{
       credentials = tournament.credentials;
    }

    return credentials;
}

const getCurrentMatchCredentials = async (tId, uId, matchId, credentials) => {
    const bracket = await Bracket.findOne({ tId: tId });
    const match = bracket.matches[matchId-1];
    
    const IsSlotBooked = match.participants.find(participant => participant.id.toString() === uId);
    if(IsSlotBooked){
        credentials = match.credentials;
    }

    return credentials;
}

const updateTournamentCredentialsService = async (id, data) => {
    const currentTournament = await Tournament.findById(id);

    if(currentTournament.settings.competitionMode === "knockout"){
        //for knockout games credentials
        const bracket = await getBracketService(id);
        const currentMatchId = currentTournament.settings.currentMatchId - 1;
        const match = bracket.matches[currentMatchId];
        match.credentials = data;  // Update the credentials for the match

        const updatedBracket = {
            ...bracket.toObject(),
            matches: [...bracket.matches]  // Make a copy of matches array to avoid mutation
        };
        updatedBracket.matches[currentMatchId] = match;
   
        const finalBracket = await Bracket.findOneAndUpdate({ tId: id }, updatedBracket, {
            new: true,
            runValidators: false
        });
    }

    //for ladder games credentials
    const updatedTournament = {
        ...currentTournament.toObject(),
        credentials: data,
        version: currentTournament.version + 1 // increment the version field
    };

    const tournament = await Tournament.findOneAndUpdate({ _id: id }, updatedTournament, {
        new: true,
        runValidators: false
    });
    
    const populatedTournament = await getTournamentDetailsService(tournament._id);
    return populatedTournament;
}

const updateTournamentResultService = async (id, winnerData) => {
    const currentTournament = await Tournament.findById(id);

    if(currentTournament.settings.competitionMode === "knockout"){
        //for knockout games credentials
        const bracket = await getBracketService(id);

        //currentMatch
        const currentMatchIndex = currentTournament.settings.currentMatchId - 1;
        const match = bracket.matches[currentMatchIndex];

        //nextMatch
        const nextMatchIndex = match.nextMatchId ? (match.nextMatchId - 1) : (match.id - 1);
        const nextMatch = bracket.matches[nextMatchIndex];

        const winnerIndex = match.participants.findIndex(participant => participant.id.toString() === winnerData.id);

        if (winnerIndex !== -1) {
            const loserIndex = winnerIndex === 0 ? 1 : 0;
            const loserData = match.participants[loserIndex];
            
            // Update the winner's data in the match
            match.participants[winnerIndex] = {
                ...winnerData,
                resultText: 'WON',
                isWinner: true,
                status: 'PLAYED'
            };

            // Update the loser's data in the match (the other player)
            match.participants[loserIndex] = {
                ...loserData.toObject(),
                resultText: 'LOST',
                isWinner: false,
                status: 'PLAYED'
            };

            // 1. Update the match with winner loser and add the winner to next match
            bracket.matches[currentMatchIndex] = match;
            console.log('bracketVersionCr:', bracket.version)
            bracket.version = bracket.version + 1;
            console.log('bracketVersionUp:', bracket.version)

            let registrationEnd = currentTournament.dates.registrationEnd;
            let tournamentStart = currentTournament.dates.tournamentStart;
            let tournamentEnd = currentTournament.dates.tournamentEnd;
            let currentMatchRunningId = currentTournament.settings.currentMatchId;

            if(currentMatchIndex === nextMatchIndex){
                tournamentEnd = new Date()
            }else{
                registrationEnd = new Date();
                tournamentStart = nextMatch.startTime;
                currentMatchRunningId = currentTournament.settings.currentMatchId + 1;

                //then entry the user to the next match!
                nextMatch.participants.push(winnerData);
                bracket.matches[nextMatchIndex] = nextMatch;
            }

            const finalBracket = await Bracket.findOneAndUpdate({ tId: id }, bracket, {
                new: true,
                runValidators: false
            });
            // console.log("finalBracket", finalBracket);

            // Update currentMatchIndex of tournament settings and new dates
            const updatedTournament = {
                ...currentTournament.toObject(),
                dates: {
                    ...currentTournament.dates.toObject(),
                    registrationEnd: registrationEnd,
                    tournamentStart: tournamentStart,
                    tournamentEnd: tournamentEnd
                },
                settings: {
                    ...currentTournament.settings.toObject(),
                    currentMatchId: currentMatchRunningId
                }
            };
            // console.log("updatedTournament", updatedTournament);

            const tournament = await Tournament.findOneAndUpdate({ _id: id }, updatedTournament, {
                new: true,
                runValidators: false
            });

            const populatedTournament = await getTournamentDetailsService(tournament._id);
            // console.log("populatedTournament", populatedTournament);
            return populatedTournament;
        }
    }else{
        // Convert winnerIds to an array of ObjectIds
        const winnerObjectIds = winnerData.map((id) => new mongoose.Types.ObjectId(id));

        const updatedTournament = {
            ...currentTournament.toObject(),
            results: winnerObjectIds,
            dates: {
                ...currentTournament.dates.toObject(),
                tournamentEnd: new Date()
            },
        };
        const tournament = await Tournament.findOneAndUpdate({ _id: id }, updatedTournament, {
            new: true,
            runValidators: false
        });

        const populatedTournament = await getTournamentDetailsService(tournament._id);
        return populatedTournament;
    }
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

//2. PREVIOUSONE
// const addUserToLeaderboardService = async (tId, uId) => {
//     //pushing user id inside separate leaderboard
//     const currentLeaderboard = await Leaderboard.findOne({ tId: tId });
//     // console.log("currentLeaderboard", currentLeaderboard)

//     if (currentLeaderboard.leaderboards.indexOf(uId) !== -1) {
//         console.log('leaderboard already exists or didnt get')
//         return false
//     } else {
//         const result = await Leaderboard.findOneAndUpdate(
//             { _id: currentLeaderboard._id },
//             { $push: { leaderboards: { $each: [uId], $position: 0 } }, $inc: { version: 1 } },
//             { new: true }
//         );
//         console.log('leaderboard push done')
        
//         return result;
//     }
// };

const addUserToLeaderboardService = async (tId, uId, gameId) => {
    //pushing user id inside separate leaderboard
    const currentLeaderboard = await Leaderboard.findOne({ tId: tId });
    // console.log("currentLeaderboard", currentLeaderboard)

    const userIndex = currentLeaderboard.leaderboards.findIndex(entry => entry.gamer.equals(uId));
    console.log('userIndex')

    if (userIndex !== -1) {
        console.log('Gamer already exists')
        return false
    } else {
        // Create a new entry with the user and gameId
        const newLeaderboardEntry = {
            gamer: uId, // ObjectId of the user
            gameAccount: gameId, // The gameId for the user
        };
        console.log('newLeaderboardEntry', newLeaderboardEntry)

        const result = await Leaderboard.findOneAndUpdate(
            { _id: currentLeaderboard._id },
            {
                $addToSet: {
                    leaderboards: newLeaderboardEntry,
                },
                $inc: { version: 1 },
            },
            { new: true }
        );
        console.log('leaderboard push done', result)
        
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
                                        .populate([
                                            { path: 'masterProfile', select: excludedMasterFields },
                                            { path: 'leaderboards' },  // Add the path for leaderboards
                                            { path: 'bracket' }        // Add the path for bracket
                                        ]);
                                        // .populate('masterProfile', excludedMasterFields)
    
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
            const bracket = await bracketEntryService(currentTournament, generatedBracket)
            
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
                bracket:  bracket._id
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
    getTournamentResultService,
    addUserToLeaderboardService,
    getBracketService,
    getCredentialsService,
    updateTournamentCredentialsService,
    updateTournamentResultService,
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