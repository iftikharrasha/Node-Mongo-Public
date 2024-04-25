const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');
const PartySocial = require('./partysocial.model');

const partySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    owner: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    photo: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://img.freepik.com/premium-photo/hand-holding-wireless-joystick_34478-686.jpg?size=626&ext=jpg&ga=GA1.1.386372595.1698451200&semt=ais'
    },
    coverPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://cdn.mos.cms.futurecdn.net/K25hmMiqGfy99J7VDPyteX-1200-80.jpg'
    },
    privacy: {
        type: String,
        enum: {
            values: ["inviteonly", "public"],
            message: "{VALUE} is not a valid privacy!",
        },
        required: true
    },
    questions: {
        type: [String],
        default: ['NA']
    },
    answers: [{ type: ObjectId, ref: 'Answer'}],
    members: {
        invited: [{ type: ObjectId, ref: 'User'}],
        requested: [{ type: ObjectId, ref: 'User'}],
        joined: [{ type: ObjectId, ref: 'User'}],
    },
    tournaments: [{
        type: ObjectId,
        ref: 'Tournament'
    }],
    status: {
        type: String,
        enum: {
            values: [ "active", "paused", "blocked"],
            message: "{VALUE} is not a valid status!",
        },
        default: "active",
    },
    version: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

partySchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'parties' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'parties', version: 1 });
    }

    next();
});

partySchema.post('save', async function(doc, next) {
    try {
        const partysocial = new PartySocial({ 
            party: doc._id, 
            partyTitle: doc.title,
        });
        await partysocial.save();
        next();
    } catch (error) {
        next(error);
    }
});

const Party = mongoose.model('Party', partySchema);
module.exports = Party;
