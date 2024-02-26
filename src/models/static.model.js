const mongoose = require('mongoose');
const Version = require('./version.model');
const { ObjectId } = mongoose.Schema.Types;

const sliderSchema = new mongoose.Schema({
  h2: { type: String, required: true },
  p: { type: String, required: true },
  gametype: { type: String, required: true },
  thumbnail: { type: String, required: true }
},{ _id: false });

const linksSchema = new mongoose.Schema({
  title: { type: String, required: true },
  path: { type: String, required: true }
},{ _id: false });

const numbersSchema = new mongoose.Schema({
  title: { type: String, required: true }
},{ _id: false });

const ulSchema = new mongoose.Schema({
  links: {
    h4: { type: String, required: true },
    li: [linksSchema]
  },
  numbers: {
    h4: { type: String, required: true },
    li: [numbersSchema]
  },
  newsletter: {
    h4: { type: String, required: true },
    button: { type: String, required: true }
  }
},{ _id: false });

const footerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  copyright: { type: String, required: true },
  h6: { type: String, required: true },
  ul: { type: ulSchema, required: true }
},{ _id: false });

const heroSchema = new mongoose.Schema({
  h1: { type: String, required: true },
  p: { type: String, required: true },
  button: { type: String, required: true },
  sliders: [sliderSchema]
},{ _id: false });

const langSchema = new mongoose.Schema({
  hero: { type: heroSchema, required: true },
  featured: {
    h2: { type: String, required: true }
  },
  footer: { type: footerSchema, required: true },
},{ _id: false });


const staticSchema = new mongoose.Schema({
  uk: { 
    type: langSchema, 
    required: true 
  },
  bd: { 
    type: langSchema, 
    required: true 
  },
  ksa: { 
    type: langSchema, 
    required: true 
  },
  platforms: {
      type: [String],
      enum: {
          values: ['psn', 'xbox', 'pc', 'mobile', 'nintendo'],
          message: "{VALUE} is not a valid platform!",
      },
      default: []
  },
  games: [{ 
    gameTitle: {
      type: String,
      enum: {
          values: ["pubg", "warzone", "freefire", "fifa", "rocket league", "clash of clans", "clash royale"],
          message: "{VALUE} is not a valid gameTitle!",
      },
      required: true 
    },
    eligiblePlatforms: [ 
      { 
        type: String, 
        enum: {
            values: ['psn', 'xbox', 'pc', 'mobile', 'nintendo', 'cross'],
            message: "{VALUE} is not a valid platform!",
        },
        required: true 
      }
    ],
    crossPlatforms: [ 
      { 
        type: String, 
        enum: {
            values: ['psn', 'xbox', 'pc', 'mobile', 'nintendo'],
            message: "{VALUE} is not a valid platform!",
        },
        required: true 
      }
    ],
    refs: {
      bot: { 
        type: ObjectId, 
        ref: "User" 
      },
      party: { 
        type: ObjectId, 
        ref: "Party" 
      }
    },
  }],
  version: { 
    type: Number, 
    default: 1 
  },
}, { timestamps: true });

staticSchema.pre('save', async function() {
    const versionTable = await Version.findOne({ table: 'statics' });
    if (versionTable) {
      versionTable.version = versionTable.version + 1;
      await versionTable.save();
    } else {
      await Version.create({ table: 'statics', version: 1 });
    }
});

const Static = mongoose.model('Static', staticSchema);
module.exports = Static;

