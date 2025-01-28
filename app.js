const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser")

require('dotenv').config();

const port = process.env.PORT || 3000;

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
        return Array(8).fill(null).map(() => Array(6).fill(""));  // ✅ Ensuring a valid 8x6 matrix
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


app.get("/", (req, res, next)=>{
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

app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    
});