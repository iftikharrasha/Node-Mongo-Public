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

const actionsSchema = new mongoose.Schema({
    invite: {
        type: Boolean
    },
    kick: {
        type: Boolean
    },
    transfer: {
        type: Boolean
    },
    leave: {
        type: Boolean
    },
    delete: {
        type: Boolean
    },
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
            values: ["pubg", "warzone", "freefire", "csgo", "rocket league", "clash of clans", "clash royale"],
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
    },
    coverPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
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
    size: {
        type: Number,
        default: 3,
    },
    actions: {
        type: actionsSchema,
        default: {
            invite: false,
            kick: false,
            transfer: false,
            leave: false,
            delete: false,
        },
    },
    members: {
        invited: [{ type: ObjectId, ref: 'User'}],
        mates: [{ type: ObjectId, ref: 'User'}],
    },
    notifications: {
        type: ObjectId,
        ref: 'Notification',
    },
    accountTag: {
        type: String,
        default: 'player',
        enum: {
            values: ['epic', 'activision', 'ea', 'steam', 'battelnet', 'supercell', 'faceit', 'player'],
            message: "{VALUE} is not a valid accountTag!",
        },
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
                }else if (category === 'rocket league') {
                    return true
                }else if (category === 'clash of clans') {
                    return true
                }else if (category === 'clash royale') {
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

    // Calculate percentage
    // this.calculateCompletionPercentage();

    // Add coverImage
    this.addTeamImagesTags();

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

teamSchema.pre('findOneAndDelete', async function (next) {
    const versionTable = await Version.findOne({ table: 'teams' });
    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    }
    next();
});

teamSchema.methods.addTeamImagesTags = function() {
    const category = this.category;
    let coverPhoto;
    let photo;
    let size;
    let tag;

    if (category === 'pubg') {
        photo = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
        coverPhoto = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
        size = 4;
        tag = 'player';
    } else if (category === 'freefire') {
        photo = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
        coverPhoto = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
        size = 4;
        tag = 'player';
    } else if (category === 'csgo') {
        photo = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
        coverPhoto = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
        size = 5;
        tag = 'faceit';
    } else if (category === 'warzone') {
        photo = 'https://e24reactor-s3-bucket.s3.amazonaws.com/images/tournaments/5442ff27-ed75-49c8-a2c9-6631f34264e2-download.jpg';
        coverPhoto = 'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2020/03/warzone-dropping-in-to-the-map-modern-warfare.jpg';
        size = 4;
        tag = 'activision';
    } else if (category === 'rocket league') {
        photo = 'https://variety.com/wp-content/uploads/2020/07/rocket-league.jpg?w=1000&h=563&crop=1&resize=1000%2C563';
        coverPhoto = 'https://variety.com/wp-content/uploads/2020/07/rocket-league.jpg?w=1000&h=563&crop=1&resize=1000%2C563';
        size = 6;
        tag = 'epic';
    } else if (category === 'clash of clans') {
        photo = 'https://media.newyorker.com/photos/590977c9019dfc3494ea2f7f/master/w_2560%2Cc_limit/Johnston-Clash-Clans.jpg';
        coverPhoto = 'https://media.newyorker.com/photos/590977c9019dfc3494ea2f7f/master/w_2560%2Cc_limit/Johnston-Clash-Clans.jpg';
        size = 6;
        tag = 'supercell';
    } else if (category === 'clash royale') {
        photo = 'https://www.touchtapplay.com/wp-content/uploads/2016/03/how-to-fix-clash-royale-connection-problems.jpg?fit=1000%2C592';
        coverPhoto = 'https://www.touchtapplay.com/wp-content/uploads/2016/03/how-to-fix-clash-royale-connection-problems.jpg?fit=1000%2C592';
        size = 50;
        tag = 'supercell';
    } else {
        photo = 'https://pbs.twimg.com/profile_images/1648571357171679233/kVd8vhxW_400x400.jpg';
        coverPhoto = 'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/apps/393380/8c58d098e9d2238ccea5d241d4fecde88b5e3481.jpg';
        size = 3;
        tag = 'player';
    }
  
    this.photo = photo;
    this.coverPhoto = coverPhoto;
    this.size = size;
    this.accountTag = tag;
};

const Team = mongoose.model('Team', teamSchema);
module.exports = Team;

// #TODO: