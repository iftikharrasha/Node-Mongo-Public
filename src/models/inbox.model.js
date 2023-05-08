const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const inboxSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  senderName: {
    type: String,
    required: true,
  },
  senderPhoto: {
    type: String,
    required: true,
  },
  senderPermissions: {
    type: [String],
    required: true,
  },
  receiverId: {
    type: ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timeStamp: {
    type: Date,
    required: true,
  },
  read: {
    type: Boolean,
    required: true,
  },
  messageCount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

const Inbox = mongoose.model('Inbox', inboxSchema);
module.exports = Inbox;
