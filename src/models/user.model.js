const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const bcrypt = require("bcryptjs");
const Version = require('./version.model');
const Transaction = require('./transaction.model');

const addressSchema = new mongoose.Schema({
    street: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    country: {
      type: String,
      default: null
    },
    zipCode: {
      type: String,
      default: null
    }
},{ _id: false });

const gameSchema = new mongoose.Schema({
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

const socialSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: null
    },
    userName: {
        type: String,
        default: null
    },
},{ _id: false });

const gameAccountsSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: null
    },
    userName: {
        type: String,
        default: null
    },
},{ _id: false });

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true,
        minLength: [3, "firstName must be at least 3 characters."],
        maxLength: [20, "firstName is too large"],
        default: null
    },
    lastName: {
        type: String,
        trim: true,
        minLength: [3, "lastName must be at least 3 characters."],
        maxLength: [20, "lastName is too large"],
        default: null
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female", "other"],
            message: "{VALUE} is not a valid gender!",
        }
    },
    userName: {
        type: String,
        trim: true,
        unique: [true, "userName has to be unique"],
        required: [true, "Please provide a username"],
        minLength: [3, "userName must be at least 3 characters."],
        maxLength: [14, "userName is too large"],
        validate: {
          validator: (value) => /^[a-zA-Z0-9]+$/.test(value),
          message: "Special characters and spaces are not allowed in userName",
        },
    },
    emailAddress: {
        type: String,
        validate: [validator.isEmail, "Provide a valid Email"],
        trim: true,
        lowercase: true,
        unique: [true, "Email address has to be unique"],
        required: [true, "Email address is required"]
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: {
            values: ["active", "inactive", "blocked"],
            message: "{VALUE} is not a valid status!",
        },
        default: "active",
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
    },
    aboutMe: {
        type: String,
        default: null
    },
    photo: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://i.ibb.co/5FFYTs7/avatar.jpg'
    },
    coverPhoto: {
        type: String,
        validate: [validator.isURL, "Please provide a valid image url"],
        default: 'https://i.ibb.co/dkCdrxk/cover-Image.jpg'
    },
    mobileNumber: {
        type: String,
        required: [true, "Mobile number is required"],
        validate: [validator.isMobilePhone, "Please provide a valid mobile number"]
    },
    dateofBirth: {
        type: Date,
        default: null
    },
    version: { 
        type: Number, 
        default: 1 
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: (value) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            maxLength: 64,
            minNumbers: 1,
            minUppercase: 1,
            minSymbols: 1,
          }),
        message: "Password {VALUE} is not strong enough.",
      },
      // select: false, // This line ensures that the password field is never returned in any API response
    },
    permissions: {
        type: [String],
        enum: {
            values: ['user', 'master', 'admin'],
            message: "{VALUE} is not a valid permission!",
        },
        default: ['user']
    },
    address: {
        type: addressSchema,
        default: {
            street: null,
            city: null,
            state: null,
            country: null,
            zipCode: null
        }
    },
    country: {
      type: String,
      default: null
    },
    friends: { 
        type: Number, 
        default: 0 
    },
    followers: { 
        type: Number, 
        default: 0 
    },
    requests: {
        follow: {
            following:  [{ type: ObjectId, ref: 'User'}],
            follower: [{ type: ObjectId, ref: 'User'}],
        },
        friend: {
            sent: [{ type: ObjectId, ref: 'User'}],
            mutuals: [{ type: ObjectId, ref: 'User'}],
            pending:  [{ type: ObjectId, ref: 'User'}],
        },
    },
    parties: {
        owner: [{ type: ObjectId, ref: 'Party'}],
        // joined: [{ type: ObjectId, ref: 'Party'}],
        joined: { 
            type: [{ type: ObjectId, ref: 'Party' }], 
            default: function() {
                return ['65851d4304cf34c8d4649e2e'];
            }
        },
    },
    teams: [{ type: ObjectId, ref: 'Team' }],
    purchasedItems: {
        tournaments: [{
          type: ObjectId,
          ref: 'Tournament'
        }],
        topups: [{
          type: ObjectId,
          ref: 'Topup'
        }]
    },
    badgeRef: [{ type: ObjectId, ref: 'UsersBadge' }],
    stats: {
        totalTournamentPlayed: {
            type: Number,
            default: 0
        },
        totalWins: {
            type: Number,
            default: 0
        },
        totalLosses: {
            type: Number,
            default: 0
        },
        totalDraws: {
            type: Number,
            default: 0
        },
        totalXp: {
            type: Number,
            default: 0
        },
        totalLoots: {
            type: Number,
            default: 0
        },
        totalGems: {
            type: Number,
            default: 0
        },
        levelTitle: {
            type: String,
            default: "Iron Shakled"
        },
        currentLevel: {
            type: Number,
            default: 1
        },
        currentXP: {
            type: Number,
            default: 0
        },
        nextLevelRequiredXP: {
            type: Number,
            default: 500
        },
        totalGamePlayed: {
            type: Number,
            default: 0
        },
        games: {
            fifa: {
                type: gameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0,
                }
            },
            pubg: {
                type: gameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            },
            freefire: {
                type: gameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            },
            csgo: {
                type: gameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            }
        },
    },
    socials: {
        facebook: {
          type: socialSchema,
          default: null
        },
        twitter: {
            type: socialSchema,
            default: null
        },
        instagram: {
            type: socialSchema,
            default: null
        },
        youtube: {
            type: socialSchema,
            default: null
        },
        discord: {
            type: socialSchema,
            default: null
        },
        twitch: {
            type: socialSchema,
            default: null
        },
    },
    gameAccounts: [{
      type: ObjectId,
      ref: 'GameAccount'
    }],
}, { timestamps: true });

userSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'users' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'users', version: 1 });
    }

    //encrypting the password to hash
    const password = this.password;
    const hashedPassword = bcrypt.hashSync(password);
    this.password = hashedPassword;

    next();
});

userSchema.post('save', async function(doc, next) {
    try {
        const transaction = new Transaction({ 
            uId: doc._id, 
            uName: doc.userName 
        });
        await transaction.save();
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.pre('findOneAndUpdate', async function() {
  const versionTable = await Version.findOne({ table: 'users' });
  if (versionTable) {
    const updatedVersion = versionTable.version + 1;
    await versionTable.updateOne({ version: updatedVersion });
  } else {
    await Version.create({ table: 'users', version: 1 });
  }
});

userSchema.pre('findOneAndDelete', async function() {
    const versionTable = await Version.findOne({ table: 'users' });
    if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
    }
});

userSchema.methods.comparePassword = function (password, hash) {
    const isPasswordValid = bcrypt.compareSync(password, hash);
    return isPasswordValid;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

// #TODO:
// 1. when user data is updated like permissions, the token needs to be updated too otherwise authorize issues
// 2. When a api is sent with jwt, that jwt needs to be for the person who initiated the api
// 3. when user is deleted his transaction needs to be deleted too, but he is still on leaderboard!
// 4. when purchased user version needs to be updated, purchased item needs to be injected in redux store of user profile
// 5. When a user becomes master his jwt token needs to be updated too to get header options