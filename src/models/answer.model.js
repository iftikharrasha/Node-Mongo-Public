const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');

const answerSchema = new mongoose.Schema({
        partyId: {
            type: ObjectId,
            ref: 'Party',
            required: true
        },
        partyName: {
            type: String,
            required: true
        },
        version: { 
            type: Number, 
            default: 1 
        },
        uId: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        uName: {
            type: String,
            required: true
        },
        answers: {
            type: [String],
            required: true
        }
}, { timestamps: true });

answerSchema.pre("save", async function (next) {
        const versionTable = await Version.findOne({ table: 'answers' });

        if (versionTable) {
                versionTable.version = versionTable.version + 1;
                await versionTable.save();
        } else {
                await Version.create({ table: 'answers', version: 1 });
        }

        next();
});

const Answer = mongoose.model('Answer', answerSchema);
module.exports = Answer;
