const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');
const Leaderboard = require('./leaderboard.model');
const cache = require("../utils/cacheInstance");

const pubgMaps = ['erangel', 'nusa', "livik", 'miramar', 'sanhok', 'vikendi', "karakin", "NA"];
const freefireMaps = ['bermuda', 'purgatory', 'kalahari', 'alpine', 'nexterra', "NA"];
const csgoMaps = ["dust II", "mirage", "overpass", "vertigo", "train", "inferno", "nuke", "ancient", "cache", "NA"];
const warzoneMaps = ["verdansk", "rebirth island", "NA"];
const fifaMaps = ["Old Trafford", "santiago narnabue", "NA"];

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
    }
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

const platformsSchema = new mongoose.Schema({
    ps: {
        type: Boolean,
        default: false
    },
    xbox: {
        type: Boolean,
        default: false
    },
    pc: {
        type: Boolean,
        default: false
    },
    nintendo: {
        type: Boolean,
        default: false
    },
    mobile: {
        type: Boolean,
        default: false
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
        default: 'https://i.ibb.co/qs7QcBV/freefire-tourney.webp'
    },
    tournamentCover: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        // required: true,
        default: 'https://galactic.dynamiclayers.net/wp-content/themes/galactic/assets/img/body-bg.jpg',
    },
    category: {
        type: String,
        enum: {
            values: ["pubg", "warzone", "freefire", "csgo", "fifa"],
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
                }else if (category === 'warzone') {
                    return warzoneMaps.includes(map);
                }else if (category === 'fifa') {
                    return fifaMaps.includes(map);
                }else {
                    return false;
                }
            },
            message: props => `${props.value} is not a valid map for ${props.path}`
        }
    },
    platforms: { 
        type: platformsSchema,
        default: {
            ps: false,
            xbox: false,
            pc: false,
            nintendo: false,
            mobile: false,
        }
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
    this.addTournamentCover();
  
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

        // Invalidate the cache for tournaments
        const key = `/api/v1/tournaments?version=${versionTable.version}`;
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

tournamentSchema.methods.addTournamentCover = function() {
    const category = this.category;
    let tournamentCover;

    if (category === 'pubg') {
        tournamentCover = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
    } else if (category === 'freefire') {
        tournamentCover = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
    } else if (category === 'csgo') {
        tournamentCover = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
    } else if (category === 'warzone') {
        tournamentCover = 'https://whatifgaming.com/wp-content/uploads/2022/11/Warzone-2-1.jpg';
    } else if (category === 'fifa') {
        tournamentCover = 'https://fifauteam.com/images/stadiums/england/OldTrafford/24.webp';
    } else {
        tournamentCover = 'https://galactic.dynamiclayers.net/wp-content/themes/galactic/assets/img/body-bg.jpg';
    }
  
    this.tournamentCover = tournamentCover;
};

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;


// purchase, registrationEnd, tournamentEnd issue
// categories -> filter
// tournamentCreated -> createdAt
// percentage break down in 8 stage
// getAllInternalTournamentsService of admin check his id if admin or not before returning data