const mongoose = require('mongoose');
const Version = require('./version.model');
const validator = require("validator");

const badgeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  instruction: {
    type: String,
    required: true
  },
  icon: {
      type: String,
      validate: [validator.isURL, "Please provide a valid image url"],
      default: 'https://cdn-icons-png.flaticon.com/512/3179/3179458.png'
  },
  xpReqToComplete: { 
    type: Number, 
    default: 120
  },
  category: {
      type: String,
      enum: {
          values: ["user", "master", "team"],
          message: "{VALUE} is not a valid category!",
      },
      default: "user"
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
