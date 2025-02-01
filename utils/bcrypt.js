const bcrypt = require ("bcrypt");
const dbgr = require("debug")("development:chessGame/bcrypt");

module.exports = {
    generateHash: async (password) => {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        return password = hashedPassword;
    },

    compare: (password, comparePassword) => {
        const isMatch = bcrypt.compare(password, comparePassword);
        // if(isMatch) dbgr("Password Matched");
        if (!isMatch) {
            req.flash('error', 'Invalid credentials');
            dbgr("Password Didn't Match");
            return res.redirect('/login');
        }
    }
}