const mongoose = require('mongoose');
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;

const chatRoomSchema = new mongoose.Schema({
    roomId: {
        type: ObjectId,
        ref: 'Tournament',
        required: true,
    },
    room: {
        type: String,
        required: true
    },
    senderId: {
        type: ObjectId,
        ref: 'User',
        required: true,
    },
    senderName: {
        type: String,
        required: true
    },
    senderPermissions: {
        type: [String],
        enum: {
            values: ['user', 'master', 'admin'],
            message: "{VALUE} is not a valid permission!",
        },
        required: true,
    },
    senderPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

const Chatroom = mongoose.model('Chatroom', chatRoomSchema);
module.exports = Chatroom;
