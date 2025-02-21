// Import Firebase config (initializes Firebase Admin SDK)
const { db, usersRef, displaysRef, timetableRef, eventsRef } = require("../config/firebase");

module.exports = {
    viewTT: async (req, res) => {
        try {
            // 🔹 Fetch all timetable data from Firebase
            const timetableSnapshot = await timetableRef.once("value");
            const timetableData = timetableSnapshot.val() || {};
    
            // 🔹 Fetch all display boards
            const displaysSnapshot = await displaysRef.once("value");
            const displays = displaysSnapshot.val() || {}; // Get all boards            
    
            // 🔹 Extract class names (e.g., "MtechCS2Sem", "MtechIASE2Sem")
            const classNames = Object.keys(timetableData);
            const boardNames = Object.keys(displays);

    
            // ✅ Pass displays to EJS
            res.render("timetable", { displays, classNames, boardNames, selectedClass: null, selectedDay: null, timetable: {} });
    
        } catch (error) {
            console.error("❌ Error fetching timetable:", error);
            res.status(500).send("Internal Server Error");
        }
    },
    

    getTimetableByClass: async (req, res) => {
        try {
            const { className } = req.params;
            const { boardId } = req.query; // Receive boardId from frontend

            // 🔹 Fetch timetable for the selected class
            const classSnapshot = await timetableRef.child(className).once("value");
            const timetable = classSnapshot.val() || {};

            // 🔹 Extract available days
            const availableDays = Object.keys(timetable);

            // ✅ Save selected timetable class & board to `eventsRef`
            const eventData = {
                boardId,
                timetableID: className
            };
            // ✅ Clear message first
            await eventsRef.child("message").set(null);
            await eventsRef.child("timetable").set(eventData);

            res.json({ success: true, availableDays, timetable });

        } catch (error) {
            console.error("❌ Error fetching timetable:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },

    getTimetableByClassAndDay: async (req, res) => {
        try {
            const { className, day } = req.params;

            // 🔹 Fetch timetable for the specific class & day
            const daySnapshot = await timetableRef.child(className).child(day).once("value");
            const timetable = daySnapshot.val() || {};

            res.json({ success: true, timetable });

        } catch (error) {
            console.error("❌ Error fetching timetable:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },

    saveTT: async (req, res) => {
        try {
            const { className, timetable } = req.body;
            console.log("saveTT "+req.body);

            if (!className || typeof timetable !== "object") {
                return res.status(400).json({ success: false, message: "Invalid data format" });
            }

            // 🔹 Save timetable for the selected class
            await timetableRef.child(className).set(timetable);

            res.json({ success: true, message: "Timetable saved successfully!" });

        } catch (error) {
            console.error("❌ Error saving timetable:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },

    updateTT: async (req, res) => {
        try {
            const { className, day, time, subject } = req.body;
            console.log("updateTT "+req.body);

            if (!className || !day || !time || !subject) {
                return res.status(400).json({ success: false, message: "All fields are required" });
            }

            // 🔹 Update the timetable in Firebase
            await timetableRef.child(`${className}/${day}/${time}`).set(subject);

            res.json({ success: true, message: "Timetable updated successfully!" });

        } catch (error) {
            console.error("❌ Error updating timetable:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
};
