const jwt = require("jsonwebtoken");
const config = require("../config/development.json")

const generateAccessToken = (user) => {
    return jwt.sign({ email: user.email, id: user._id }, config.JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
    return jwt.sign({ email: user.email, id: user._id }, config.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};

const verifyToken = (token) => {
    return jwt.verify(token, config.JWT_SECRET);
}

const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.JWT_REFRESH_SECRET);
}

module.exports = { generateAccessToken, generateRefreshToken, verifyToken, verifyRefreshToken };