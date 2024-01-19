const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const leaderboardSchema = new mongoose.Schema({
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
  leaderboards: [
    {
        gamer: {
            type: ObjectId,
            ref: "User",
        },
        gameAccount: {
            type: ObjectId,
            ref: "GameAccount",
        },
    },
  ],
}, { timestamps: true });

//everytime a tournament added should we update the version table of bulk leaderboards?
leaderboardSchema.pre("save", async function (next) {
  const versionTable = await Version.findOne({ table: 'leaderboards' });

  if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
  } else {
      await Version.create({ table: 'leaderboards', version: 1 });
  }
  
  next();
});

leaderboardSchema.pre('findOneAndUpdate', async function (next) {
  const versionTable = await Version.findOne({ table: 'leaderboards' });
  if (versionTable) {
    versionTable.version = versionTable.version + 1;
    await versionTable.save();
  }
  console.log('leaderboards version: ' + versionTable.version)

  next();
});

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
module.exports = Leaderboard;
