const mongoose = require('mongoose');
const validator = require("validator");
const bcrypt = require("bcryptjs");

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
},
{ _id: false });

const socialSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: null
    },
    userName: {
        type: String,
        default: null
    },
},
{ _id: false });

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
        enum: ["male", "female", "other"]
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
    joiningDate: { 
        type: Date, 
        default: Date.now 
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
    },
    permissions: {
        type: [String],
        enum: ['user', 'master', 'admin'],
        default: ['user']
    },
    address: {
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
    },
    requests: {
        followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        followings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
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
});

userSchema.pre("save", function (next) {
    // if (!this.isModified("password")) {
    //   //  only run if password is modified, otherwise it will change every time we save the user!
    //   return next();
    // }
    const password = this.password;
    const hashedPassword = bcrypt.hashSync(password);
    this.password = hashedPassword;
    // this.confirmPassword = undefined;
  
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
