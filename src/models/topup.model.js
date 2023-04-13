const mongoose = require('mongoose');
const Version = require('./version.model');

const topupSchema = new mongoose.Schema({
  version: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    required: true
  },
  token: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  background: {
    type: String,
    required: true
  }
}, { timestamps: true });

topupSchema.pre('save', async function() {
  const versionTable = await Version.findOne({ table: 'topups' });
  if (versionTable) {
    // this.version = versionTable.version + 1;  //if we want to update the document as well
    // versionTable.version = this.version;
    versionTable.version = versionTable.version + 1;
    await versionTable.save();
  } else {
    await Version.create({ table: 'topups', version: 1 });
  }
});

topupSchema.pre('findOneAndUpdate', async function() {
  const versionTable = await Version.findOne({ table: 'topups' });
  if (versionTable) {
    const updatedVersion = versionTable.version + 1;
    // this.set('version', updatedVersion);  //if we want to update the document as well
    await versionTable.updateOne({ version: updatedVersion });
  } else {
    await Version.create({ table: 'topups', version: 1 });
  }
});

topupSchema.pre('findOneAndDelete', async function() {
  const versionTable = await Version.findOne({ table: 'topups' });
  if (versionTable) {
    // this.version = versionTable.version + 1;  //if we want to update the document as well
    // versionTable.version = this.version;
    versionTable.version = versionTable.version + 1;
    await versionTable.save();
  }
});

const Topup = mongoose.model('Topup', topupSchema);
module.exports = Topup;
