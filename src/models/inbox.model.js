const mongoose = require('mongoose');
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;

const inboxSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
    },
    senderId: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    senderName: {
        type: String,
        required: true,
    },
    senderPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        required: true,
    },
    senderPermissions: {
        type: [String],
        enum: {
            values: ['user', 'master', 'admin'],
            message: "{VALUE} is not a valid permission!",
        },
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
    read: {
        type: Boolean,
        default: false 
    },
    messageCount: {
        type: Number,
        default: 0 
    },
}, { timestamps: true });

const Inbox = mongoose.model('Inbox', inboxSchema);
module.exports = Inbox;
