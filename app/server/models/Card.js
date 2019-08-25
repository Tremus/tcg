const { model, Schema } = require('mongoose');

const CardSchema = new Schema({
    pk: {
        type: Number,
        required: true,
        min: 1,
    },
    name: {
        type: String,
        match: /[a-zA-Z0-9,_\-%\s]+/,
        required: true,
    },
    civilization: {
        type: String,
        enum: ['Light', 'Water', 'Darkness', 'Fire', 'Nature'],
        required: true,
    },
    type: {
        type: String,
        enum: ['Creature', 'Spell'],
        required: true,
    },
    manaCost: {
        type: Number,
        max: 15,
        min: 1,
        required: true,
    },
    race: {
        type: String,
        // required: true,
        // TODO: enum
    },
    abilities: [String],
    power: {
        type: Number,
        min: 1000,
        max: 24000,
        // required: true,
    },
    flavorText: String,
    manaNumber: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
        max: 1,
    },
    illustrator: {
        type: String,
        required: true,
    },
    set: {
        type: String,
        enum: ['DM-01 Base Set'],
        required: true,
    },
    rarity: {
        type: String,
        enum: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Super Rare'],
        required: true,
    },
    no: {
        type: String,
        match: /[S0-9\/]+/,
        required: true,
    },

    srcDisplayUrl: {
        type: String,
        required: true,
    },
    srcThumbnailUrl: {
        type: String,
        required: true,
    },
    articleUrl: {
        type: String,
        required: true,
    },
    imageName: {
        type: String,
        required: true,
    },
});

// Compile model from schema
module.exports = model('Card', CardSchema);
