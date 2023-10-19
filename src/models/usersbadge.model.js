const mongoose = require('mongoose');
const Version = require('./version.model');
const { ObjectId } = mongoose.Schema.Types;

// const usersbadgeSchema = new mongoose.Schema({
//   uId: {
//     type: ObjectId,
//     ref: 'User',
//     required: true
//   },
//   uName: {
//     type: String,
//     required: true
//   },
//   version: { 
//     type: Number, 
//     default: 1 
//   },
//   badges: [{ type: ObjectId, ref: "Badge" }],
// }, { timestamps: true });

const usersbadgeSchema = new mongoose.Schema({
    uId: {
      type: ObjectId,
      ref: 'User',
      required: true
    },
    uName: {
      type: String,
      required: true
    },
    badge: { type: ObjectId, ref: "Badge" },
    level: { 
      type: Number, 
      default: 1 
    },
    xpTotal: { 
      type: Number, 
      default: 0 
    },
    claimed: { 
      type: Boolean,  
      default: true 
    },
    locked: { 
      type: Boolean,  
      default: false 
    },
    version: { 
      type: Number, 
      default: 1 
    },
  }, { timestamps: true });

usersbadgeSchema.pre("save", async function (next) {
  const versionTable = await Version.findOne({ table: 'usersbadges' });

  if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
  } else {
      await Version.create({ table: 'usersbadges', version: 1 });
  }

  next();
});

const UsersBadge = mongoose.model('usersbadge', usersbadgeSchema);
module.exports = UsersBadge;
