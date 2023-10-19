const mongoose = require('mongoose');
const Version = require('./version.model');
const validator = require("validator");

const badgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  icon: {
      type: String,
      validate: [validator.isURL, "Please provide a valid image url"],
      default: 'https://cdn-icons-png.flaticon.com/512/3179/3179458.png'
  },
  instruction: {
    type: String,
    required: true
  },
  category: {
      type: String,
      enum: {
          values: ["user", "master", "team"],
          message: "{VALUE} is not a valid category!",
      },
      default: "user"
  },
  slag: { 
    type: String, 
    enum: {
        values: ["create_account", "create_team", "join_tournament", "win_streak", "win_as_teammate", "win_as_captain", "runner_up", "third_place", "team_streak", "popularity", "reward_by_master", "gaming_machine", "patriot", "to_be_declared"],
        message: "{VALUE} is not a valid category!",
    },
    default: "to_be_declared"
  },
  xp: { 
    type: Number, 
    default: 120
  },
  loots: { 
    type: Number, 
    default: 200
  },
  gems: { 
    type: Number, 
    default: 1
  },
  once: { 
    type: Boolean,  
    default: false
  },
  priority: { 
    type: Number, 
    default: 1 
  },
  version: { 
    type: Number, 
    default: 1 
  },
}, { timestamps: true });

badgeSchema.pre("save", async function (next) {
  const versionTable = await Version.findOne({ table: 'badges' });

  if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
  } else {
      await Version.create({ table: 'badges', version: 1 });
  }

  next();
});

const Badge = mongoose.model('badge', badgeSchema);
module.exports = Badge;
