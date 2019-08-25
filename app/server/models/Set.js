const { model, Schema } = require('mongoose');
const { ObjectId } = Schema.Types;

const SetSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    items: [{ type: ObjectId, ref: 'Card' }],
});

// Compile model from schema
module.exports = model('Set', SetSchema);
