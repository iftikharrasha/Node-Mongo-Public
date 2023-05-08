const mongoose = require('mongoose');
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
        required: true
    },
    invokedByName: { 
        type: String,
        required: true
    },
    invokedById: { 
        type: ObjectId,
        required: true 
    },
    receivedByName: { 
        type: String,
        required: true 
    },
    receivedById: { 
        type: ObjectId,
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
