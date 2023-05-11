const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const purchaseSchema = new mongoose.Schema({
    purchasedById: { 
        type: ObjectId,
        ref: 'User',
        required: true 
    },
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
            values: ["bkash", "card", "balance"],
            message: "{VALUE} is not a valid method",
        },
        default: 'balance' 
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
            values: ["approved", "pending", "incoming", "cancelled"],
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

purchaseSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'purchases' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'purchases', version: 1 });
    }

    next();
});

const Purchase = mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
