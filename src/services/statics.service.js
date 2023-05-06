
const Static = require('../models/static.model');

const getLandingStaticsService = async () => {
    const static = await Static.findOne({})
    return static;
}

const createStaticService = async (data) => {
    const static = await Static.create(data);
    return static;
}

module.exports = {
    getLandingStaticsService,
    createStaticService
}