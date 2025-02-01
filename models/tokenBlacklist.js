const mongoose = require('mongoose');

const tokenBlacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600 // The token will automatically be removed after 1 hour
    }
});

module.exports = mongoose.model('TokenBlacklist', tokenBlacklistSchema);