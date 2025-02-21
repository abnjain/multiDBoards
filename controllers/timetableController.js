const path = require("path");
const fs = require("fs");

// Import Firebase config (initializes Firebase Admin SDK)
const { db, usersRef, displaysRef, timetableRef } = require("../config/firebase");

// Path to the JSON file
const timetablePath = path.join(__dirname, "../timetable.json");

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

module.exports = {
    viewTT: async (req, res) => {
        try {
            // 🔹 Fetch timetable data from Firebase Realtime Database
            const timetableSnapshot = await timetableRef.once("value");
            const timetableData = timetableSnapshot.val() || {}; // Ensure it's not null

            console.log("✅ Timetable Data from Firebase:", JSON.stringify(timetableData, null, 2));

            // 🔹 Extract Days & Times (Sorting times in order)
            const days = Object.keys(timetableData);
            const times = [...new Set(days.flatMap(day => Object.keys(timetableData[day])))]
                .sort((a, b) => a.localeCompare(b)); // Sort times in ascending order

            // 🔹 Convert to structured array for rendering
            const structuredTimetable = times.map(time => {
                const row = { time };
                days.forEach(day => {
                    row[day] = timetableData[day][time] || ""; // If no entry, leave blank
                });
                return row;
            });

            // 🔹 Render timetable.ejs
            res.render("timetable", { timetable: structuredTimetable, days, times });

        } catch (error) {
            console.error("❌ Error fetching timetable data:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    saveTT: (req, res) => {
        console.log("Received Timetable Data:", req.body);
    
        let { timetable } = req.body;
    
        if (!Array.isArray(timetable)) {
            return res.status(400).json({ success: false, message: "Invalid timetable format" });
        }
    
        saveTimetable(timetable);
        res.json({ success: true, message: "Timetable saved successfully" });
    },

    updateTT: (req, res) => {
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
    }

}