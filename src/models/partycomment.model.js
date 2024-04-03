const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const commentSchema = new mongoose.Schema({
    author: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    mentioned: {
        type: ObjectId,
        ref: 'User'
    },
    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true });


const partyCommentSchema = new mongoose.Schema({
    partySocial: {
        type: ObjectId,
        ref: 'PartySocial',
        required: true
    },
    party: {
        type: ObjectId,
        ref: 'Party',
        required: true
    },
    version: { 
        type: Number, 
        default: 1 
    },
    comments: [commentSchema],
}, { timestamps: true });

partyCommentSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'partycomments' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'partycomments', version: 1 });
    }

    next();
});

const PartyComment = mongoose.model('PartyComment', partyCommentSchema);
module.exports = PartyComment;
