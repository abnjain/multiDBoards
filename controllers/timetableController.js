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
            const { boardId } = req.query; // Ensure boardId is retrieved from query parameters
    
            if (!className || !boardId) {
                return res.status(400).json({ success: false, message: "Missing className or boardId" });
            }
        
            // Fetch timetable for the selected class
            const classSnapshot = await timetableRef.child(className).once("value");
            const timetable = classSnapshot.val() || {};
    
            // Extract available days
            const availableDays = Object.keys(timetable);
    
            // ✅ Ensure boardId is defined before updating Firebase
            if (boardId) {
                const eventTT = {
                    timetableID: className
                };
    
                await displaysRef.child(`${boardId}`).update(eventTT);
            } else {
                console.warn("⚠️ boardId is undefined, skipping Firebase update.");
            }
    
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
            const { boardId, className, day, timetable } = req.body;

            if (!boardId || !className || !day || !timetable) {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            // Save timetable under the correct class and day
            await timetableRef.child(className).child(day).set(timetable);

            // Save board reference
            await eventsRef.child("message").update({ boardId, timetableClass: className });

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
