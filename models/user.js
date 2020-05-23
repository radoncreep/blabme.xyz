const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    googleId: String,
    email: {
        type: String,
    },
    password: {
        type: String,
        // required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'Messages'
    }]
});

module.exports = mongoose.model('Users', userSchema);