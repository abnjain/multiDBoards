const TokenBlacklist = require('../models/tokenBlacklist');

const blacklistToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ error: 'A token is required for authentication' });
    }

    const tokenEntry = await TokenBlacklist.findOne({ token });
    if (tokenEntry) {
        return res.status(401).json({ error: 'Token has been blacklisted' });
    }

    next();
};

module.exports = blacklistToken;
