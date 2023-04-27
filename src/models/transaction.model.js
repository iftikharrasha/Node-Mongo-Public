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

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;
