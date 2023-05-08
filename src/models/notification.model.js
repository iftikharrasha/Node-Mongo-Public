const mongoose = require('mongoose');
const validator = require("validator");
const { ObjectId } = mongoose.Schema.Types;

const notificationSchema = new mongoose.Schema({
    type: { 
        type: String,
        required: true
    },
    subject: { 
        type: String,
        required: true 
    },
    subjectPhoto: { 
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        required: true
    },
    invokedByName: { 
        type: String,
        required: true
    },
    invokedById: { 
        type: ObjectId,
        ref: 'User',
        required: true
    },
    receivedByName: { 
        type: String,
        required: true 
    },
    receivedById: { 
        type: ObjectId,
        ref: 'User',
        required: true 
    },
    route: { 
        type: String,
        required: true  
    },
    read: { 
        type: Boolean,
        default: false 
    }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
