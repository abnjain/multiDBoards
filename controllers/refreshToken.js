// refreshToken.js
const express = require('express');
const router = express.Router();
const { verifyRefreshToken, generateAccessToken } = require("../utils/jwt");
const User = require('../models/userModel');

router.get('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return res.status(403).json({ error: 'A refresh token is required for authentication' });
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const accessToken = generateAccessToken(user);
        res.cookie('token', accessToken, { httpOnly: true });
        return res.status(200).json({ accessToken });
    } catch (err) {
        return res.status(401).json({ error: 'Invalid refresh token' });
    }
});

module.exports = router;
