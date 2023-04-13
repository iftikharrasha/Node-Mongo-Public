const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  table: {
    type: String,
    required: true
  },
  version: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Version = mongoose.model('Version', versionSchema);
module.exports = Version;
