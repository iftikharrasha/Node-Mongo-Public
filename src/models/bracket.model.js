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
        default: null 
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
        default: 'https://img.freepik.com/free-icon/mime_318-856855.jpg?q=10&h=200' 
    },
},{ _id: false });

const credentialsSchema = new mongoose.Schema({
    roomId: {
        type: String,
        default: null
    },
    roomPassword: {
        type: String,
        default: null
    }
},{ _id: false });

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
    credentials: { 
        type: credentialsSchema,
        default: {
            roomId: null,
            roomPassword: null,
        }
    },
},{ _id: false });

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
bracketSchema.pre("save", async function (next) {
  const versionTable = await Version.findOne({ table: 'brackets' });

  if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
  } else {
      await Version.create({ table: 'brackets', version: 1 });
  }
  
  next();
});

bracketSchema.pre('findOneAndUpdate', async function (next) {
    const versionTable = await Version.findOne({ table: 'brackets' });
    if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
    }

    console.log('brackets version: ' + versionTable.version)

    // Invalidate the cache for tournaments
    // const key = `/api/v1/tournaments?version=${versionTable.version}`;
    // // Invalidate multiple cache keys
    // const keys = [
    //     `/api/v1/tournaments?version=${versionTable.version}`,
    //     '/api/v1/other-endpoint',
    //     // Add more keys here
    // ];
    // console.log('Invalidating', key);
    // cache.del(key); 
  
    next();
  });

const Bracket = mongoose.model('Bracket', bracketSchema);
module.exports = Bracket;
