const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const participantSchema = new mongoose.Schema({
    id: { 
        type: ObjectId, 
        ref: "User" 
    },
    resultText: { 
        type: String, 
        default: null 
    },
    isWinner: { 
        type: Boolean, 
        default: false 
    },
    status: { 
        type: String, 
        default: null 
    },
    name: { 
        type: String, 
        default: null 
    },
    picture: { 
        type: String, 
        default: null 
    },
});

const matchSchema = new mongoose.Schema({
    id: { 
        type: Number, 
        default: null 
    },
    name: { 
        type: String, 
        default: null 
    },
    nextMatchId: { 
        type: Number, 
        default: null 
    },
    nextLooserMatchId: { 
        type: Number, 
        default: null 
    },
    tournamentRoundText: { 
        type: String, 
        default: null 
    },
    startTime: { 
        type: Date, 
        default: null 
    },
    state: { 
        type: String, 
        default: null 
    },
    participants: [participantSchema],
});

const bracketSchema = new mongoose.Schema({
    tId: {
        type: ObjectId,
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
    matches: [matchSchema]
}, { timestamps: true });

// //everytime a tournament added should we update the version table of bulk leaderboards?
// bracketSchema.pre("save", async function (next) {
//   const versionTable = await Version.findOne({ table: 'leaderboards' });

//   if (versionTable) {
//       versionTable.version = versionTable.version + 1;
//       await versionTable.save();
//   } else {
//       await Version.create({ table: 'leaderboards', version: 1 });
//   }
  
//   next();
// });

// bracketSchema.pre('findOneAndUpdate', async function (next) {
//   const versionTable = await Version.findOne({ table: 'leaderboards' });
//   if (versionTable) {
//     versionTable.version = versionTable.version + 1;
//     await versionTable.save();
//   }

//   next();
// });

const Bracket = mongoose.model('Bracket', bracketSchema);
module.exports = Bracket;
