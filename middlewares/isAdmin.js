const { verifyToken } = require("../utils/jwt");

module.exports = async function (req, res, next) {
    if (!req.cookies || !req.cookies.token) {
        return res.redirect("/");
    }

    try {
        const decoded = verifyToken(req.cookies.token);

        if (!decoded.isAdmin) {
            return res.status(400).json({ success: false, redirect:"/", message: "Not an admin user" });
        }
        next();
    } catch (error) {
        console.error("Not an admin user --> ", error.message);
        return res.redirect("/");
    }
};
