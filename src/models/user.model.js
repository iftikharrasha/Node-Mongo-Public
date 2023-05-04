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
        required: [true, "Please provide a first name"],
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
        required: [true, "mobileNumber is required"],
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
    requests: {
        followers: [{ type: ObjectId, ref: 'User' }],
        followings: [{ type: ObjectId, ref: 'User' }]
    },
    teams: [{ type: ObjectId, ref: 'Team' }],
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
        levelTitle: {
            type: String,
            default: "ameture"
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
            default: 140
        },
        totalGamePlayed: {
            type: Number,
            default: 0
        },
        games: {
            fifa: {
                type: GameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            },
            pubg: {
                type: GameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            },
            freefire: {
                type: GameSchema,
                default: {
                    played: 0,
                    win: 0,
                    defeat: 0
                }
            },
            csgo: {
                type: GameSchema,
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
        steam: {
            type: socialSchema,
            default: null
        },
        faceit: {
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
        playstation: {
            type: socialSchema,
            default: null
        },
        xbox: {
            type: socialSchema,
            default: null
        },
    }
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
// 0. when user deleted transactions needs to be deleted too
// 1. when user data is updated like permissions, the token needs to be updated too otherwise authorize issues
// 2. When a api is sent with jwt, that jwt needs to be for the person who initiated the api