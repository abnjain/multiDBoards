const { generateHash, compare } = require("../utils/bcrypt");
const { generateAccessToken, generateRefreshToken, verifyToken } = require("../utils/jwt");

// Import Firebase config (initializes Firebase Admin SDK)
const { usersRef } = require("../config/firebase");

// const serviceAccount = require("../multidboard-firebase-adminsdk-fbsvc-8dcc5c148b.json"); // Ensure this file is in your root folder
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: process.env.FIREBASE_DB_URL
// });

// const db = admin.database(); // Use Firebase RTDB
// const usersRef = db.ref("users"); // Reference to the "users" collection

const displayData = {
    title: "Cloud IoT Display Board",
    message: "Welcome to Smart Display!",
    lastUpdated: new Date().toLocaleString(),
};

module.exports = {
    // register: async (req, res) => {
    //     const { userName, firstName, lastName, userImage, dob, age, email, password } = req.body;
    //     try {
    //         // Check if user exists by email
    //         const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
    //         if (snapshot.exists()) {
    //             req.flash('error', 'User email already exists. Try logging in.');
    //             return res.redirect('/register');
    //         }

    //         // Check if user exists by userName
    //         const userNameSnapshot = await usersRef.orderByChild("userName").equalTo(userName).once("value");
    //         if (userNameSnapshot.exists()) {
    //             req.flash('error', 'Username already exists. Choose another.');
    //             return res.redirect('/register');
    //         }

    //         const hashedPassword = await generateHash(password);
    //         const newUserRef = usersRef.push();
    //         await newUserRef.set({
    //             id: newUserRef.key,
    //             userName,
    //             firstName,
    //             lastName,
    //             userImage,
    //             dob,
    //             age,
    //             email,
    //             password: hashedPassword,
    //             refreshToken: ""
    //         });

    //         req.flash("success", "Registration successful. You can now log in.");
    //         res.status(201).render("login");
    //     } catch (error) {
    //         console.error("Error during registration:", error.message, error);
    //         req.flash("error", "Internal Server Error");
    //         res.status(500).json({ error: "Internal Server Error" });
    //     }
    // },

    login: async (req, res) => {
        const { email, password } = req.body;
        try {
            const snapshot = await usersRef.orderByChild("email").equalTo(email).once("value");
            
            if (!snapshot.exists()) {
                return res.redirect('/login');
            }
    
            const userData = Object.values(snapshot.val())[0];
            const userId = Object.keys(snapshot.val())[0];
    
            // Compare plain text passwords
            if (userData.password !== password) {
                return res.redirect('/login');
            }
    
            const accessToken = generateAccessToken({ id: userId, email: userData.email });
            const refreshToken = generateRefreshToken({ id: userId, email: userData.email });
    
            await usersRef.child(userId).update({ refreshToken });
    
            req.session.userId = userId;
            res.cookie('token', accessToken, { httpOnly: true });
            res.cookie('refreshToken', refreshToken, { httpOnly: true });
    
            console.log("Session userId:", req.session.userId);
    
            res.redirect('/'); // Redirect to the index page
        } catch (error) {
            console.error("Error during login:", error.message, error.stack);
            return res.redirect('/login');
        }
    },
    

    logout: async (req, res) => {
        const accessToken = req.cookies.token;
        const refreshToken = req.cookies.refreshToken;

        try {
            const decoded = verifyToken(accessToken);
            const userId = decoded.id;

            // Fetch user from Firebase
            const userSnapshot = await usersRef.child(userId).once("value");
            if (!userSnapshot.exists()) {
                // req.flash("error", "User not found");
                return res.redirect("/login");
            }

            // Remove refreshToken in Firebase
            await usersRef.child(userId).update({ refreshToken: "" });

            // Clear cookies
            res.clearCookie("token");
            res.clearCookie("refreshToken");

            // req.flash("success", "User Logout successful");
            return res.redirect("/login");
        } catch (error) {
            console.error("Error during logout:", error.message, error);
            req.flash("error", "Internal Server Error");
            return res.redirect("/login");
        }
    }
};
