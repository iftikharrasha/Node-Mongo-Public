const mongoose = require("mongoose");
const validator = require("validator");
const Version = require('./version.model');
const Leaderboard = require('./leaderboard.model');

const pubgMaps = ['erangel', 'nusa', "livik", 'miramar', 'sanhok', 'vikendi', "karakin", "NA"];
const freefireMaps = ['bermuda', 'purgatory', 'kalahari', 'alpine', 'nexterra', "NA"];
const csgoMaps = ["dust II", "mirage", "overpass", "vertigo", "train", "inferno", "nuke", "ancient", "cache", "NA"];
const warzoneMaps = ["verdansk", "rebirth island", "NA"];

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
            values: ["solo", "team", "open"],
            message: "{VALUE} is not a valid mode!",
        },
        default: "solo"
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
        default: 'https://i.ibb.co/BN5qYV4/freefire-cover.jpg'
    },
    category: {
        type: String,
        enum: {
            values: ["pubg", "warzone", "freefire", "csgo"],
            message: "{VALUE} is not a valid category!",
        },
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["active", "inactive", "blocked"],
            message: "{VALUE} is not a valid status!",
        },
        default: "inactive",
    },
    filter: {
        type: [String],
        enum: {
            values: ['upcoming', 'featured', 'sponsored', 'latest'],
            message: "{VALUE} is not a valid filter!",
        },
        default: ['latest']
    },
    // purchased: { type: Boolean, default: false },
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
            map: "NA",
            rounds: 1,
            tournamentRules: null,
            teamSize: 1,
            registrationEnd: false,
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
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    // userName: { type: String },
    // emailVerified: { type: Boolean },
    // countryCode: { type: String },
    // photo: { type: String },
    // avgRating: { type: Number },
    // totalRatings: { type: Number },
    // followers: { type: Object }
    leaderboards: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    completionPercentage: {
      type: Number,
      default: 0
    }
}, { timestamps: true });

tournamentSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'tournaments' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'tournaments', version: 1 });
    }

    this.calculateCompletionPercentage();

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

tournamentSchema.pre('findOneAndUpdate', async function() {
    const requiredFields = ['tournamentName', 'tournamentThumbnail', 'category', 'settings.joiningFee', 'dates.registrationStart', 'dates.registrationEnd'];
    const updatedFields = this.getUpdate(); //returns an object that contains the changes made to the tournament document after update
    const tournament = await this.model.findOne(this.getFilter());

    // Calculate the completion percentage based on the updated fields
    let completedFields = 0;
    requiredFields.forEach(field => {
        if (updatedFields[field] || tournament[field]) {
            completedFields++;
        }
    });
    const completionPercentage = Math.round(completedFields / requiredFields.length * 100);
    // console.log("completionPercentage", completionPercentage);
    
    // Update the completion percentage field
    this.updateOne({ completionPercentage: completionPercentage });

    // Update version table
    const versionTable = await Version.findOne({ table: 'tournaments' });
    if (versionTable) {
      const updatedVersion = versionTable.version + 1;
      await versionTable.updateOne({ version: updatedVersion });
    } else {
      await Version.create({ table: 'tournaments', version: 1 });
    }
});

tournamentSchema.pre('findOneAndDelete', async function() {
    const versionTable = await Version.findOne({ table: 'tournaments' });
    if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
    }
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
 

const Tournament = mongoose.model("Tournament", tournamentSchema);
module.exports = Tournament;


// purchase, registrationEnd, tournamentEnd issue
// gameType -> category
// categories -> filter
// tournamentCreated -> createdAt
// tournamentIcon
// percentage