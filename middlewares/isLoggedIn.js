const { verifyToken } = require("../utils/jwt");
const admin = require("firebase-admin");

// Initialize Firebase Admin SDK (if not already initialized)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("../multidboard-firebase-adminsdk-fbsvc-221d0b219f.json")), // Path to your Firebase service account key
        databaseURL: process.env.FIREBASE_DB_URL, // Firebase Realtime Database URL
    });
}

const db = admin.database();
const usersRef = db.ref("users"); // Reference to the "users" collection in Firebase

module.exports = async function (req, res, next) {
    // Check if the token cookie exists
    if (!req.cookies.token) {
        return res.redirect("/login"); // Redirect to login if no token is found
    }

    try {
        // Verify the JWT token
        const decoded = verifyToken(req.cookies.token);

        // Fetch the user from Firebase using the decoded user ID
        const snapshot = await usersRef.child(decoded.id).once("value");

        // If the user doesn't exist, redirect to login
        if (!snapshot.exists()) {
            return res.redirect("/login");
        }

        // Attach the user data to the request object
        req.user = snapshot.val();
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Error verifying user:", error.message);
        return res.redirect("/login"); // Redirect to login if token verification fails
    }
};