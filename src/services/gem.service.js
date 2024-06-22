const Gem = require('../models/gem.model');

const getGemPriceService = async (id) => {
    // const gem = await Gem.findOne({ })
    // return gem;
    const gem = await Gem.findOne();
    const change = gem.price && gem.prevPrice ? ((gem.price - gem.prevPrice) / gem.prevPrice) * 100 : 0;

    return {
      price: gem.price ? gem.price : 0,
      change: change
    };
}

module.exports = {
    getGemPriceService,
}