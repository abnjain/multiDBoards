// const dbgr = require('debug')('development:chessGame/authenticateToken');
const TokenBlacklist = require('../models/tokenBlacklist');
const { verifyToken } = require('../utils/jwt');

module.exports = authenticateToken = async (req, res, next) => {
    const token = req.cookies.token;

    const blacklistedToken = await TokenBlacklist.findOne({ token });
    if (blacklistedToken) {
        console.log("Not Authorized to Play Game");
        return res.status(401).json({ error: 'Token has been blacklisted' });
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid Token' });
    }
};

