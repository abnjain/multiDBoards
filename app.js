const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);


// require("./config/mongoDB");
require("./config/firebase");
require("dotenv").config();

const port = process.env.PORT || 3000;

// Import Firebase config (initializes Firebase Admin SDK)
const { db, usersRef, displaysRef, timetableRef } = require("./config/firebase");

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // use secure cookies in production
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}));

// Use cookie-parser before routes
app.use(cookieParser());

const isLoggedIn = require("./middlewares/isLoggedIn");
const userRouter = require("./routes/userRoute");

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// Dummy data for display board
const displayData = {
    title: "Cloud IoT Display Board",
    message: "Welcome to Smart Display!",
    lastUpdated: new Date().toLocaleString(),
  };

// Path to the JSON file
const timetablePath = path.join(__dirname, "timetable.json");

// Load timetable from JSON file
function loadTimetable() {
    if (!fs.existsSync(timetablePath)) {
        return Array(8).fill(null).map(() => Array(6).fill(""));  // Ensuring a valid 8x6 matrix
    }
    return JSON.parse(fs.readFileSync(timetablePath, "utf8"));
}

// Save timetable to JSON file
function saveTimetable(timetable) {
    try {
        fs.writeFileSync(timetablePath, JSON.stringify(timetable, null, 2));
        console.log("Timetable saved successfully.");
    } catch (error) {
        console.error("Error saving timetable:", error);
    }
}
// Load initial timetable
let timetable = loadTimetable()

app.use("/auth", userRouter);

app.get("/login", (req, res) => {
    res.render("login", { title: "Display Boards" });
});

app.get("/", isLoggedIn, (req, res, next) => {
    const userId = req.session.userId; // Retrieve userId from the session
    res.render("index", { displayData });
});

// Time Table Route
app.get("/timetable", (req, res) => {
    res.render("timetable", { timetable });
});

// Save timetable API
app.post("/save-timetable", (req, res) => {
    console.log("Received Timetable Data:", req.body);

    let { timetable } = req.body;

    if (!Array.isArray(timetable)) {
        return res.status(400).json({ success: false, message: "Invalid timetable format" });
    }

    saveTimetable(timetable);
    res.json({ success: true, message: "Timetable saved successfully" });
});

// Update individual cell in timetable (New)
app.post("/update-timetable", (req, res) => {
    const { row, col, value } = req.body;

    // Ensure that row and col are within the valid range
    if (row < 0 || row >= timetable.length || col < 0 || col >= timetable[row].length) {
        return res.status(400).json({ success: false, message: "Invalid cell position" });
    }

    // Update the timetable cell
    timetable[row][col] = value;

    // Save the updated timetable
    saveTimetable(timetable);

    res.json({ success: true, message: "Timetable updated successfully" });
});

app.get("/board", async (req, res) => {
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
app.post("/update-board", async (req, res) => {
    const { boardId, message, date, startTime, endTime } = req.body;

    if (!boardId || !message || !date || !startTime || !endTime) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        await displaysRef.child(boardId).update({ 
            message, 
            date, 
            startTime, 
            endTime,
            timeRange: `${startTime} to ${endTime}`,
            lastUpdated: new Date().toISOString() 
        });

        res.json({ success: true, message: "Display board updated successfully" });
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