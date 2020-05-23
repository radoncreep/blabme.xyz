const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messagesSchema = new Schema({
    body: {
            type: String,
            required: true
        },
    userDetails: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    sender: { type: Number }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Messages', messagesSchema);