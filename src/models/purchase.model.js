const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const productSchema = new mongoose.Schema({
    amount: { 
        type: Number,
        default: 0,
        min: 0,
    },
    country: { 
        type: String,
        default: 'gb' 
    },
    currency: { 
        type: String,
        enum: {
            values: ["bdt", "usd", "sar", "etoken"],
            message: "{VALUE} is not a valid currency",
        },
        default: 'usd'
    },
    trx: { 
        type: String,
        default: '-' 
    },
    method: { 
        type: String,
        enum: {
            values: ["bkash", "stripe", "etoken"],
            message: "{VALUE} is not a valid method",
        },
        default: 'etoken' 
    },
    remarks: { 
        type: String,
        enum: {
            values: ["registration", "topup", "prize", "transfer", "earning", "refund", "withdraw", "unknown"],
            message: "{VALUE} is not a valid remarks",
        },
        default: 'unknown' 
    },
    route: { 
        type: String,
        enum: {
            values: ["u2a", "a2u", "u2u"],
            message: "{VALUE} is not a valid route",
        },
        default: 'u2a' 
    },
    activity: { 
        type: String,
        enum: {
            values: ["expense", "withdrawal", "earning", "unknown"],
            message: "{VALUE} is not a valid activity",
        },
        default: 'unknown' 
    },
    status: {
        type: String,
        enum: {
            values: ["approved", "pending", "incoming", "cancelled", "blocked"],
            message: "{VALUE} is not a valid status",
        },
        default: "pending",
    },
    description: { 
        type: String,
        minLength: [6, "description must be at least 6 characters."],
        maxLength: [40, "description is too large"],
        default: null  
    },
    tId: { 
        type: ObjectId,
        ref: 'Tournament',
        default: null 
    },
    giftId: { 
        type: ObjectId,
        ref: 'Topup',
        default: null 
    },
    teamId: { 
        type: ObjectId,
        ref: 'Team',
        default: null 
    },
    version: { 
        type: Number, 
        default: 1 
    },
}, { timestamps: true });

const Purchase = mongoose.model('Purchase', productSchema);
module.exports = Purchase;
