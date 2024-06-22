const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;
const Version = require('./version.model');

const gemSchema = new mongoose.Schema({
    createdBy: {
        type: ObjectId,
        ref: 'User',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    prevPrice: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
}, { timestamps: true });

gemSchema.pre("save", async function (next) {
    const versionTable = await Version.findOne({ table: 'gems' });

    if (versionTable) {
        versionTable.version = versionTable.version + 1;
        await versionTable.save();
    } else {
        await Version.create({ table: 'gems', version: 1 });
    }

    next();
});

const Gem = mongoose.model('gem', gemSchema);
module.exports = Gem;
