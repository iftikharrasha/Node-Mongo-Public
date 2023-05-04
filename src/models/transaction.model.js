const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const transactionSchema = new mongoose.Schema({
  uId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  uName: {
    type: String,
    required: true
  },
  version: { 
    type: Number, 
    default: 1 
  },
  transactions: [{ type: ObjectId, ref: "Purchase" }]
}, { timestamps: true });

transactionSchema.pre("save", async function (next) {
  const versionTable = await Version.findOne({ table: 'transactions' });

  if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
  } else {
      await Version.create({ table: 'transactions', version: 1 });
  }

  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
