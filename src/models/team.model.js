const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');

const GameSchema = new mongoose.Schema({
    played: {
        type: Number,
        default: 0
    },
    win: {
        type: Number,
        default: 0
    },
    defeat: {
        type: Number,
        default: 0
    }
},{ _id: false });

const statsSchema = new mongoose.Schema({
    totalTournamentPlayed: {
        type: Number
    },
    totalWins: {
        type: Number
    },
    totalLosses: {
        type: Number
    },
    totalDraws: {
        type: Number
    },
    totalXp: {
        type: Number
    },
    levelTitle: {
        type: String
    },
    currentLevel: {
        type: Number
    },
    currentXP: {
        type: Number
    },
    nextLevelRequiredXP: {
        type: Number
    },
    totalGamePlayed: {
        type: Number
    },
    games: {
      type: GameSchema
    }
},{ _id: false });

const teamSchema = new mongoose.Schema({
    captainId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    teamName: {
        type: String,
        default: null,
        required: true
    },
    category: {
        type: String,
        enum: {
            values: ["pubg", "warzone", "freefire", "csgo"],
            message: "{VALUE} is not a valid category!",
        },
        required: true
    },
    aboutUs: {
        type: String,
        default: null
    },
    photo: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://pbs.twimg.com/profile_images/1648571357171679233/kVd8vhxW_400x400.jpg'
    },
    coverPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/393380/8c58d098e9d2238ccea5d241d4fecde88b5e3481.jpg'
    },
    status: {
        type: String,
        enum: {
            values: ["active", "inactive", "blocked"],
            message: "{VALUE} is not a valid status!",
        },
        default: "inactive",
    },
    version: { 
        type: Number, 
        default: 1 
    },
    // members: [{
    //     type: ObjectId,
    //     ref: "User"
    // }],
    members: {
        invited: [{ type: ObjectId, ref: 'User'}],
        mates: [{ type: ObjectId, ref: 'User'}],
    },
    stats: {
        type: statsSchema,
        default: {
            totalTournamentPlayed: 0,
            totalWins: 0,
            totalLosses: 0,
            totalDraws: 0,
            totalXp: 0,
            levelTitle: "ameture",
            currentLevel: 1,
            currentXP: 0,
            nextLevelRequiredXP: 140,
            totalGamePlayed: 0,
            games: {
                played: 0,
                win: 0,
                defeat: 0
            }
        },
        validate: {
            validator: function(stats) {
                const category = this.category;
    
                if (category === 'pubg') {
                    return true
                }else if (category === 'freefire') {
                    return true
                }else if (category === 'csgo') {
                    return true
                }else if (category === 'warzone') {
                    return true
                }else {
                    return false;
                }
            },
            message: props => `${props.value} is not a valid map for ${props.path}`
        },
    },
}, { timestamps: true });

teamSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'teams' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'teams', version: 1 });
    }

    next();
});

teamSchema.pre('findOneAndUpdate', async function (next) {
    // Update version table
    const versionTable = await Version.findOne({ table: 'teams' });
    if (versionTable) {
        const updatedVersion = versionTable.version + 1;
        await versionTable.updateOne({ version: updatedVersion });
        console.log('teams version: ' + versionTable.version, updatedVersion)

        // Invalidate the cache for tournaments
        // const key = `/api/v1/teams?version=${updatedVersion}`;
        // // Invalidate multiple cache keys
        // const keys = [
        //     `/api/v1/teams?version=${versionTable.version}`,
        //     '/api/v1/other-endpoint',
        //     // Add more keys here
        // ];
        // console.log('Invalidating', key);
        // cache.del(key); 
    } else {
      await Version.create({ table: 'teams', version: 1 });
    }

    next();
});

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;

// #TODO: