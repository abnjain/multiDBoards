const crypto = require('crypto');
const dbgr = require("debug")("development:chessGame/crypto");

module.exports = {
    secret: () => {
        const secretKey = crypto.randomBytes(32).toString('hex');
        dbgr(secretKey);
    }
};
