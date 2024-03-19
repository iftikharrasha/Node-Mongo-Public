const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const validator = require("validator");
const Version = require('./version.model');

const gameaccountSchema = new mongoose.Schema({
  uId: {
    type: ObjectId,
    ref: 'User',
    required: true
  },
  category: {
      type: String,
      enum: {
          values: ["pubg", "warzone", "freefire", "csgo", "fifa", "rocket league", "clash of clans", "clash royale"],
          message: "{VALUE} is not a valid category!",
      },
      required: true
  },
  playerIgn: {
    type: String,
    required: true
  },
  playerId: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: {
        values: ['psn', 'xbox', 'pc', 'mobile', 'nintendo', 'NA'],
        message: "{VALUE} is not a valid platform!",
    },
  },
  tag: {
    type: String,
    default: 'player',
    enum: {
        values: ['epic', 'activision', 'ea', 'steam', 'battelnet', 'supercell', 'faceit', 'player'],
        message: "{VALUE} is not a valid accountTag!",
    },
  },
  gameLogo: {
      type: String,
      validate: [validator.isURL, "Please provide a valid image url"],
  },
  accountLogo: {
      type: String,
      validate: [validator.isURL, "Please provide a valid image url"],
  },
  crossPlay: { 
    type: Boolean, 
    default: true 
  },
  version: { 
    type: Number, 
    default: 1 
  },
}, { timestamps: true });

//everytime a tournament added should we update the version table of bulk leaderboards?
gameaccountSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'gameaccounts' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'gameaccounts', version: 1 });
    }

    // Add coverImage
    this.addAccountImage();
  
  next();
});

gameaccountSchema.pre('findOneAndUpdate', async function (next) {
    const versionTable = await Version.findOne({ table: 'gameaccounts' });
    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    }

    next();
});

gameaccountSchema.methods.addAccountImage = function() {
    const category = this.category;
    const platform = this.platform;
    let gameLogo;
    let accountLogo;

    if (category === 'pubg') {
        gameLogo = 'https://cdn.exputer.com/wp-content/uploads/2022/07/PUBG-Patch-18.2-Adds-More-Graphical-Options-For-Next-Gen-Consoles.jpg.webp';
    } else if (category === 'freefire') {
        gameLogo = 'https://d.newsweek.com/en/full/1987539/garena-free-fire-keyart.webp?w=1600&h=900&q=88&f=e35a53dbb53ee0455d23e0afef5da942';
    } else if (category === 'csgo') {
        gameLogo = 'https://i.pinimg.com/originals/7b/23/2c/7b232ccb015d9c21143b6ccd67038e63.jpg';
    } else if (category === 'warzone') {
        gameLogo = 'https://whatifgaming.com/wp-content/uploads/2022/11/warzone-2-1.jpg';
    } else if (category === 'fifa') {
        gameLogo = 'https://fifauteam.com/images/stadiums/england/OldTrafford/24.webp';
    } else if (category === 'rocket league') {
        gameLogo = 'https://variety.com/wp-content/uploads/2020/07/rocket-league.jpg?w=1000&h=563&crop=1&resize=1000%2C563';
    } else if (category === 'clash of clans') {
        gameLogo = 'https://media.newyorker.com/photos/590977c9019dfc3494ea2f7f/master/w_2560%2Cc_limit/Johnston-Clash-Clans.jpg';
    } else if (category === 'clash royale') {
        gameLogo = 'https://www.touchtapplay.com/wp-content/uploads/2016/03/how-to-fix-clash-royale-connection-problems.jpg?fit=1000%2C592';
    } else {
        gameLogo = 'https://galactic.dynamiclayers.net/wp-content/themes/galactic/assets/img/body-bg.jpg';
    }

    if (platform === 'psn') {
        accountLogo = 'https://rocketleague.media.zestyio.com/icon_playstation_w.png';
    } else if (platform === 'xbox') {
        accountLogo = 'https://rocketleague.media.zestyio.com/icon_xbox_w.png';
    } else if (platform === 'pc') {
        accountLogo = 'https://rocketleague.media.zestyio.com/rl_web_icon_pc.png';
    } else if (platform === 'mobile') {
        accountLogo = 'https://cdn-icons-png.flaticon.com/512/2734/2734739.png';
    } else if (platform === 'nintendo') {
        accountLogo = 'https://rocketleague.media.zestyio.com/icon_switch_w.png';
    } else {
        accountLogo = 'https://cdn-icons-png.flaticon.com/512/2734/2734739.png';
    }
  
    this.gameLogo = gameLogo;
    this.accountLogo = accountLogo;
};

const GameAccount = mongoose.model('GameAccount', gameaccountSchema);
module.exports = GameAccount;
