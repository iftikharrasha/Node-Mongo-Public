const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');
const Leaderboard = require('./leaderboard.model');
const cache = require("../utils/cacheInstance");

const pubgMaps = ['erangel', 'nusa', "livik", 'miramar', 'sanhok', 'vikendi', "karakin", "NA"];
const freefireMaps = ['bermuda', 'purgatory', 'kalahari', 'alpine', 'nexterra', "NA"];
const csgoMaps = ["dust II", "mirage", "overpass", "vertigo", "train", "inferno", "nuke", "ancient", "cache", "NA"];
const codMaps = ["vondel", "al mazrah", "ashika island", "NA"];
const fifaMaps = ["old trafford", "santiago barnabue", "NA"];
const rocketLeagueMaps = ["aquadome", "beckwith park", "champions field", "arctagon", "badlands", "basin", "barricade", "calavera", "carbon", "NA"];

const settingsSchema = new mongoose.Schema({
    joiningFee: {
        type: Number,
        default: 0,
        min: 0,
    },
    feeType: {
        type: String,
        enum: {
            values: ["money", "gems", "xp"],
            message: "{VALUE} is not a valid feeType!",
        },
        default: 'money'
    },
    mode: {
        type: String,
        enum: {
            values: ["solo", "team"],
            message: "{VALUE} is not a valid mode!",
        },
        default: "solo"
    },
    competitionMode: {
        type: String,
        enum: {
            values: ["ladder", "knockout"],
            message: "{VALUE} is not a valid mode!",
        },
        default: "ladder"
    },
    maxParticipitant: {
        type: Number,
        enum: {
            values: [2, 4, 8, 16, 32, 64, 128],
            message: "{VALUE} is not a valid maxParticipitant!",
        },
        default: 2
    },
    map: {
      type: String,
      default: "NA"
    },
    rounds: {
        type: Number,
        default: 1,
        min: 1
    },
    matches: {
        type: Number,
        default: 1,
        min: 1
    },
    currentMatchId: {
        type: Number,
        default: 1,
        min: 1
    },
    tournamentRules: { 
        type: String, 
        default: null 
    },
    teamSize: {
        type: Number,
        default: 1,
        min: 1
    },
    registrationEnd: { 
        type: Boolean, 
        default: false 
    },
    accountTag: {
        type: String,
        default: 'player',
        enum: {
            values: ['epic', 'activision', 'ea', 'steam', 'battelnet', 'supercell', 'faceit', 'player'],
            message: "{VALUE} is not a valid accountTag!",
        },
    },
},{ _id: false });

const prizesSchema = new mongoose.Schema({
    money: { 
        totalPrize: {
            type: Number,
            default: 0,
            min: 0
        },
        firstPrize: {
            type: Number,
            default: 0,
            min: 0
        },
        secondPrize: {
            type: Number,
            default: 0,
            min: 0
        },
        thirdPrize: {
            type: Number,
            default: 0,
            min: 0
        },
        masterProfit: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    xp: { 
        totalXp: {
            type: Number,
            default: 0,
            min: 0
        },
        firstXp: {
            type: Number,
            default: 0,
            min: 0
        },
        secondXp: {
            type: Number,
            default: 0,
            min: 0
        },
        thirdXp: {
            type: Number,
            default: 0,
            min: 0
        },
        masterXp: {
            type: Number,
            default: 0,
            min: 0
        } 
    },
    gems: { 
        totalGems: {
            type: Number,
            default: 0,
            min: 0
        },
        firstGems: {
            type: Number,
            default: 0,
            min: 0
        },
        secondGems: {
            type: Number,
            default: 0,
            min: 0
        },
        thirdGems: {
            type: Number,
            default: 0,
            min: 0
        },
        masterGems: {
            type: Number,
            default: 0,
            min: 0
        } 
    }
},{ _id: false });

const datesSchema = new mongoose.Schema({
    registrationStart: {
        type: Date,
        default: null
    },
    registrationEnd: {
        type: Date,
        default: null
    },
    tournamentStart: {
        type: Date,
        default: null
    },
    tournamentEnd: {
        type: Date,
        default: null
    }
},{ _id: false });

const credentialsSchema = new mongoose.Schema({
    roomId: {
        type: String,
        default: null
    },
    roomPassword: {
        type: String,
        default: null
    }
},{ _id: false });

const tournamentSchema = new mongoose.Schema({
    tournamentName: { 
        type: String, 
        required: true,
        minLength: [6, "tournamentName must be at least 6 characters."],
        maxLength: [35, "tournamentName is too large"]
    },
    tournamentThumbnail: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        // required: true,
    },
    tournamentCover: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        // required: true,
    },
    category: {
        type: String,
        enum: {
            values: ["pubg", "cod", "freefire", "csgo", "fifa", "rocket league", "clash of clans", "clash royale"],
            message: "{VALUE} is not a valid category!",
        },
        required: true
    },
    status: {
        type: String,
        enum: {
            values: [ "draft", "revision", "active", "pending", "blocked"],
            message: "{VALUE} is not a valid status!",
        },
        default: "draft",
    },
    filter: {
        type: [String],
        enum: {
            values: ['upcoming', 'featured', 'sponsored', 'latest'],
            message: "{VALUE} is not a valid filter!",
        },
        default: ['latest']
    },
    version: { 
        type: Number, 
        default: 1 
    },
    dates: {
        type: datesSchema,
        default: {
            registrationStart: null,
            registrationEnd: null,
            tournamentStart: null,
            tournamentEnd: null
        }
    },
    settings: {
        type: settingsSchema,
        default: {
            joiningFee: 0,
            feeType: 'money',
            mode: "solo",
            maxParticipitant: 2,
            rounds: 1,
            matches: 1,
            currentMatchId: 1,
            tournamentRules: null,
            teamSize: 1,
            registrationEnd: false,
            map: "NA",
            accountTag: 'player',
        },
        validate: {
            validator: function(settings) {
                const category = this.category;
                const map = settings.map;

                if (category === 'pubg') {
                    return pubgMaps.includes(map);
                }else if (category === 'freefire') {
                    return freefireMaps.includes(map);
                }else if (category === 'csgo') {
                    return csgoMaps.includes(map);
                }else if (category === 'cod') {
                    return codMaps.includes(map);
                }else if (category === 'fifa') {
                    return fifaMaps.includes(map);
                }else if (category === 'rocket league') {
                    return rocketLeagueMaps.includes(map);
                }else {
                    return false;
                }
            },
            message: props => `${props.value} is not a valid map for ${props.path}`
        }
    },
    platforms: {
        type: [String],
        enum: {
            values: ['psn', 'xbox', 'pc', 'mobile', 'nintendo', 'NA'],
            message: "{VALUE} is not a valid platform!",
        },
        default: ['NA']
    },
    region: {
        type: String,
        enum: {
            values: ["africa", "asia", "middle east", "europe", "central america", "north america", "south america", "oceania", "global"],
            message: "{VALUE} is not a valid region!",
        },
        default: "global",
    },
    credentials: { 
        type: credentialsSchema,
        default: {
            roomId: null,
            roomPassword: null,
        }
    },
    prizes: {
        type: prizesSchema,
        default: {
            money: {
                totalPrize: 0,
                firstPrize: 0,
                secondPrize: 0,
                thirdPrize: 0,
                masterProfit: 0
            },
            xp: {
                totalXp: 0,
                firstXp: 0,
                secondXp: 0,
                thirdXp: 0,
                masterXp: 0
            },
            gems: {
                totalGems: 0,
                firstGems: 0,
                secondGems: 0,
                thirdGems: 0,
                masterGems: 0
            }
        }
    },
    results: [{ 
        type: ObjectId, 
        ref: "User" 
    }],
    masterProfile:{ 
        type: ObjectId, 
        ref: "User" 
    },
    leaderboards: [{ 
        type: ObjectId, 
        ref: "User" 
    }],
    bracket: [{ 
        type: ObjectId, 
        ref: "Bracket" 
    }],
    completionPercentage: {
      type: Number,
      default: 0
    },
    tournamentStage: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

tournamentSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'tournaments' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'tournaments', version: 1 });
    }

    // Calculate percentage
    this.calculateCompletionPercentage();

    // Add coverImage
    this.addTournamentImagesTags();
  
    next();
});

tournamentSchema.post('save', async function(doc, next) {
    try {
        const leaderboard = new Leaderboard({ 
            tId: doc._id, 
            tName: doc.tournamentName 
        });
        await leaderboard.save();
        next();
    } catch (error) {
        next(error);
    }
});

tournamentSchema.pre('findOneAndUpdate', async function (next) {
    // Update version table
    const versionTable = await Version.findOne({ table: 'tournaments' });
    if (versionTable) {
        const updatedVersion = versionTable.version + 1;
        await versionTable.updateOne({ version: updatedVersion });
        console.log('tournaments version: ' + versionTable.version, updatedVersion)

        // Invalidate the cache for tournaments
        const key = `/api/v1/tournaments?version=${updatedVersion}`;
        // // Invalidate multiple cache keys
        // const keys = [
        //     `/api/v1/tournaments?version=${versionTable.version}`,
        //     '/api/v1/other-endpoint',
        //     // Add more keys here
        // ];
        console.log('Invalidating', key);
        cache.del(key); 
    } else {
      await Version.create({ table: 'tournaments', version: 1 });
    }

    next();
});

tournamentSchema.pre('findOneAndDelete', async function (next) {
    const versionTable = await Version.findOne({ table: 'tournaments' });
    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();

        // Invalidate the cache for tournaments
        const key = `/api/v1/tournaments?version=${versionTable.version}`;
        console.log('Invalidating', key);
        cache.del(key); 
    }
    next();
});

tournamentSchema.methods.calculateCompletionPercentage = function() {
    const requiredFields = ['tournamentName', 'tournamentThumbnail', 'category', 'settings.joiningFee', 'dates.registrationStart, dates.registrationEnd'];
    let completedFields = 0;
  
    requiredFields.forEach(field => {
      if (field.includes('.')) {
        const nestedFields = field.split('.');
        if (this[nestedFields[0]] && this[nestedFields[0]][nestedFields[1]]) {
          completedFields++;
        }
      } else {
        if (this[field]) {
          completedFields++;
        }
      }
    });
  
    const percentage = Math.round(completedFields / requiredFields.length * 100);
    this.completionPercentage = percentage;
};

tournamentSchema.methods.addTournamentImagesTags = function() {
    const category = this.category;
    let tournamentCover;
    let tournamentThumbnail;
    let tag;

    if (category === 'pubg') {
        tournamentCover = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
        tournamentThumbnail = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
        tag = 'player';
    } else if (category === 'freefire') {
        tournamentCover = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
        tournamentThumbnail = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
        tag = 'player';
    } else if (category === 'csgo') {
        tournamentCover = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
        tournamentThumbnail = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
        tag = 'faceit';
    } else if (category === 'cod') {
        tournamentCover = 'https://whatifgaming.com/wp-content/uploads/2022/11/warzone-2-1.jpg';
        tournamentThumbnail = 'https://whatifgaming.com/wp-content/uploads/2022/11/warzone-2-1.jpg';
        tag = 'activision';
    } else if (category === 'fifa') {
        tournamentCover = 'https://fifauteam.com/images/stadiums/england/OldTrafford/24.webp';
        tournamentThumbnail = 'https://fifauteam.com/images/stadiums/england/OldTrafford/24.webp';
        tag = 'ea';
    } else if (category === 'rocket league') {
        tournamentCover = 'https://variety.com/wp-content/uploads/2020/07/rocket-league.jpg?w=1000&h=563&crop=1&resize=1000%2C563';
        tournamentThumbnail = 'https://variety.com/wp-content/uploads/2020/07/rocket-league.jpg?w=1000&h=563&crop=1&resize=1000%2C563';
        tag = 'epic';
    } else if (category === 'clash of clans') {
        tournamentCover = 'https://media.newyorker.com/photos/590977c9019dfc3494ea2f7f/master/w_2560%2Cc_limit/Johnston-Clash-Clans.jpg';
        tournamentThumbnail = 'https://media.newyorker.com/photos/590977c9019dfc3494ea2f7f/master/w_2560%2Cc_limit/Johnston-Clash-Clans.jpg';
        tag = 'supercell';
    } else if (category === 'clash royale') {
        tournamentCover = 'https://www.touchtapplay.com/wp-content/uploads/2016/03/how-to-fix-clash-royale-connection-problems.jpg?fit=1000%2C592';
        tournamentThumbnail = 'https://www.touchtapplay.com/wp-content/uploads/2016/03/how-to-fix-clash-royale-connection-problems.jpg?fit=1000%2C592';
        tag = 'supercell';
    } else {
        tournamentCover = 'https://galactic.dynamiclayers.net/wp-content/themes/galactic/assets/img/body-bg.jpg';
        tournamentThumbnail = 'https://i.ibb.co/qs7QcBV/freefire-tourney.webp';
        tag = 'player';
    }
  
    this.tournamentCover = tournamentCover;
    this.tournamentThumbnail = tournamentThumbnail;
    this.settings.accountTag = tag;
};

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;


// purchase, registrationEnd, tournamentEnd issue
// categories -> filter
// tournamentCreated -> createdAt
// percentage break down in 8 stage
// getAllInternalTournamentsService of admin check his id if admin or not before returning data