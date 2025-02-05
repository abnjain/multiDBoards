const { verifyToken } = require("../utils/jwt");
const { db } = require("../config/firebase");

const usersRef = db.ref("users");

module.exports = async function (req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect("/login");
    }

    try {
        const decoded = verifyToken(req.cookies.token);

        if (!decoded.id) {
            return res.redirect("/login");
        }
        const snapshot = await usersRef.child(decoded.id).once("value");

        if (!snapshot.exists()) {
            return res.redirect("/login");
        }

        req.user = snapshot.val();
        next();
    } catch (error) {
        console.error("Error verifying user:", error.message);
        return res.redirect("/login");
    }
};
