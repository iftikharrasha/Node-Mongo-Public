const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');
const PartyComment = require('./partycomment.model');

const partySocialSchema = new mongoose.Schema({
    party: {
        type: ObjectId,
        ref: 'Party',
        required: true
    },
    partyTitle: {
        type: String,
        required: true
    },
    version: {
        type: Number,
        default: 1
    },
    posts: [
        {
            author: {
                type: ObjectId,
                ref: 'User',
                required: true
            },
            title: {
                type: String,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            thumbnail: {
                type: String,
                // validate: [validator.isURL, "Please provide a valid image url"],
                default: null
            },
            reacts: {
                likes: [{ type: ObjectId, ref: 'User'}],
                dislikes: [{ type: ObjectId, ref: 'User'}],
            },
            privacy: {
                type: String,
                enum: {
                    values: ["private", "public"],
                    message: "{VALUE} is not a valid privacy!",
                },
                default: "public"
            },
            tags: {
                type: [String],
                default: []
            },
            comments: [{ type: ObjectId, ref: 'Comments'}],
            version: {
                type: Number,
                default: 1
            }
        }
    ]
}, { timestamps: true });

// const partySocialSchema = new mongoose.Schema({
//     postedBy: {
//         type: ObjectId,
//         ref: 'User',
//         required: true
//     },
//     party: {
//         type: ObjectId,
//         ref: 'Party',
//         required: true
//     },
//     title: {
//         type: String,
//         required: true
//     },
//     description: {
//         type: String,
//         required: true
//     },
//     thumbnail: {
//         type: String,
//         // validate: [validator.isURL, "Please provide a valid image url"],
//         default: null
//     },
//     reacts: {
//         likes: [{ type: ObjectId, ref: 'User'}],
//         dislikes: [{ type: ObjectId, ref: 'User'}],
//     },
//     privacy: {
//         type: String,
//         enum: {
//             values: ["private", "public"],
//             message: "{VALUE} is not a valid privacy!",
//         },
//         default: "public"
//     },
//     tags: {
//         type: [String],
//         default: []
//     },
//     comments: [{ type: ObjectId, ref: 'Comments'}],
//     version: {
//         type: Number,
//         default: 1
//     }
// }, { timestamps: true });

partySocialSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'partysocials' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'partysocials', version: 1 });
    }

    next();
});

partySocialSchema.post('save', async function(doc, next) {
    try {
        const partycomment = new PartyComment({ 
            partySocial: doc._id, 
            party: doc.party, 
        });
        await partycomment.save();
        next();
    } catch (error) {
        next(error);
    }
});

const partySocial = mongoose.model('PartySocial', partySocialSchema);
module.exports = partySocial;
