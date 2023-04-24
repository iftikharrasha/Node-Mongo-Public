const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaderboardSchema = new Schema({
  tId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  tName: {
    type: String,
    required: true
  },
  version: { 
    type: Number, 
    default: 1 
  },
  leaderboards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
//   leaderboard: [
//     {
//       id: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true
//       },
//       userName: {
//         type: String,
//         required: true
//       },
//       country: {
//         type: String,
//         required: true
//       },
//       photo: {
//         type: String,
//         required: true
//       },
//       gender: {
//         type: String,
//         required: true
//       },
//       emailVerified: {
//         type: Boolean,
//         required: true
//       },
//       stats: {
//         type: Object,
//         required: true,
//         default: {
//           totalGamePlayed: 0,
//           totalWins: 0,
//           totalXp: 0,
//           level: 0,
//           levelTitle: 'Beginner',
//           noOfFollowers: 0
//         }
//       }
//     }
//   ]
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = Leaderboard;
