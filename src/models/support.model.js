const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const threadSchema = new mongoose.Schema({
    author: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true });


const SupportSchema = new mongoose.Schema({
    issuedBy: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    solvedBy: {
        type: ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    tag: {
        type: String,
        enum: {
            values: ["account", "tournament", "organize", "party", "payment", "guideline", "technical", "others"],
            message: "{VALUE} is not a valid tag!",
        },
        default: "others",
    },
    status: {
        type: String,
        enum: {
            values: [ "unresolved", "solved"],
            message: "{VALUE} is not a valid status!",
        },
        default: "unresolved",
    },
    version: { 
        type: Number, 
        default: 1 
    },
    thread: [threadSchema],
}, { timestamps: true });

SupportSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'supports' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'supports', version: 1 });
    }

    next();
});

const Support = mongoose.model('Support', SupportSchema);
module.exports = Support;
