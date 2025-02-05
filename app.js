const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const admin = require("firebase-admin");
const session = require("express-session");

require("dotenv").config();

const port = process.env.PORT || 3000;

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(require("./multidboard-firebase-adminsdk-fbsvc-bcdd778bd2.json")),
        databaseURL: process.env.FIREBASE_DB_URL
    });
}

// ✅ Export Firebase DB
const db = admin.database();
const usersRef = db.ref("users");
const displaysRef = db.ref("displayBoards");
const timetableRef = db.ref("timetable");

const isLoggedIn = require("./middlewares/isLoggedIn");
const userRouter = require("./routes/userRoute");

// Use cookie-parser middleware
app.use(cookieParser());

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set `secure: true` in production with HTTPS
}));

// Dummy data for display board
const displayData = {
    title: "Cloud IoT Display Board",
    message: "Welcome to Smart Display!",
    lastUpdated: new Date().toLocaleString(),
  };


app.use("/auth", userRouter);

app.get("/login", (req, res) => {
    res.render("login", { title: "Display Boards" });
});

app.get("/", isLoggedIn, (req, res, next)=>{
    const userId = req.session.userId; // Retrieve userId from the session
    res.render("index", { userId, displayData });
});

// Time Table Route
app.get("/timetable", isLoggedIn, async (req, res) => {
    try {
        const snapshot = await timetableRef.once("value");
        const timetable = snapshot.val() || []; // Default to an empty array if no data
        res.render("timetable", { timetable });
    } catch (error) {
        console.error("Error fetching timetable:", error);
        res.status(500).send("Internal Server Error");
    }
});

// // Save timetable API
// app.post("/save-timetable", (req, res) => {
//     console.log("Received Timetable Data:", req.body);

//     let { timetable } = req.body;

//     if (!Array.isArray(timetable)) {
//         return res.status(400).json({ success: false, message: "Invalid timetable format" });
//     }

//     saveTimetable(timetable);
//     res.json({ success: true, message: "Timetable saved successfully" });
// });

// // Update individual cell in timetable (New)
app.post("/update-timetable", isLoggedIn, async (req, res) => {
    const { row, col, value } = req.body;

    try {
        // Update the specific cell in the timetable
        await timetableRef.child(`${row}/${col}`).set(value);
        res.json({ success: true, message: "Timetable updated successfully" });
    } catch (error) {
        console.error("Error updating timetable:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


// Display Board Route
app.get("/board", isLoggedIn, async (req, res) => {
    try {
        const snapshot = await displaysRef.once("value");
        const displays = snapshot.val();
        if (!displays) {
            return res.render("board", { displays: {} });
        }
        res.render("board", { displays });
    } catch (error) {
        console.error("Error fetching display boards:", error);
        res.status(500).send("Internal Server Error");
    }
});

// Route to update a display board's message
app.post("/update-board", isLoggedIn, async (req, res) => {
    const { boardId, message, date, startTime, endTime } = req.body;

    if (!boardId || !message || !date || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        // Update the display board's data
        await displaysRef.child(boardId).update({ 
            message, 
            date, 
            startTime, 
            endTime,
            timeRange: `${startTime} to ${endTime}`,
            lastUpdated: new Date().toISOString() 
        });

        // Fetch the updated list of display boards
        const snapshot = await displaysRef.once("value");
        const displays = snapshot.val() || {};

        // Render the board page with the updated displays data
        res.render("index", { displays });
    } catch (error) {
        console.error("Error updating display board:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});



// // Route to fetch a specific board's details
// app.get("/display/:id", async (req, res) => {
//     const boardId = req.params.id;

//     try {
//         const boardSnapshot = await displaysRef.child(boardId).once("value");
//         const board = boardSnapshot.val();

//         if (!board) {
//             return res.status(404).send("Display board not found.");
//         }

//         res.render("display", { board });

        
//         if (!boardDoc.exists) {
//             return res.status(404).send("Display board not found.");
//         }

//         res.render("display", { board: boardDoc.data() });
//     } catch (error) {
//         console.error("Error fetching display board:", error);
//         res.status(500).send("Error fetching display board.");
//     }
// });

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});

// module.exports = { admin, db, usersRef, displaysRef };