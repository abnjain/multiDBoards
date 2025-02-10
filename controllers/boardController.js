const { db, usersRef, displaysRef, timetableRef, eventsRef } = require("../config/firebase");

module.exports = {
    displayBoard: async (req, res) => {
        try {
            const snapshot = await displaysRef.once("value");
            const displays = snapshot.val() || {};
            res.render("board", { displays });
        } catch (error) {
            console.error("Error fetching display boards:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    updateBoard: async (req, res) => {
        const { boardId, message, date, startTime, endTime } = req.body;

        if (!boardId || !message || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        try {
            // Define timeRange explicitly
            const timeRange = `${startTime} to ${endTime}`;
    
            const boardData = { 
                boardId, 
                message, 
                date, 
                startTime, 
                endTime, 
                timeRange,
                lastUpdated: new Date().toISOString() 
            };
    
            // Update Firebase with the boardData object
            await displaysRef.child(boardId).update(boardData);
            await eventsRef.child("message").update(boardData);
    
            // Fetch timetable data
            let timetableSnapshot = await eventsRef.child("timetable").once("value");
            let timetable = timetableSnapshot.val();
    
            // If no event timetable exists, fetch from timetableRef
            if (!timetable) {
                timetableSnapshot = await timetableRef.once("value");
                timetable = timetableSnapshot.val();
            }

            // ✅ Store updated displayData in session
            req.session.displayData = {
                title: "Cloud IoT Display Board",
                message: message,
                lastUpdated: new Date().toLocaleString()
            };
    
            // Render the page with board details and timetable
            res.render("currentDisplay", { board: boardData, timetable, displayData: req.session.displayData });
        } catch (error) {
            console.error("Error updating display board:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    },

    saveCurrentDisplay: async (req, res) => {
        try {
            const { timetable, board } = req.body;
    
            if (!timetable || !board) {
                return res.status(400).json({ success: false, message: "Invalid data provided" });
            }
    
            // ✅ Clear message first
            await eventsRef.child("message").set(null);
    
            // ✅ Check if timetable is empty (no timetable provided)
            const isTimetableEmpty = Object.keys(timetable).length === 0;
    
            // ✅ Save timetable if provided
            if (!isTimetableEmpty) {
                await eventsRef.child("timetable").set(timetable);
            }
    
            // ✅ Update session message based on whether timetable or board message exists
            req.session.displayData = {
                title: "Cloud IoT Display Board",
                message: isTimetableEmpty
                    ? `Message on board --> \n ${board.message}`
                    : `Displaying Current Timetable on board ${board.title}`,
                lastUpdated: new Date().toLocaleString()
            };
    
            console.log("✅ Updated session displayData:", req.session.displayData);
            // // ✅ Force session to save immediately
            // req.session.save((err) => {
            //     if (err) {
            //         console.error("❌ Error saving session:", err);
            //         return res.status(500).json({ success: false, message: "Session update failed" });
            //     }

            //     console.log("🚀 Updated session displayData:", req.session.displayData);
            //     res.json({ success: true, redirect: "/", displayData: req.session.displayData });
            // });
    
            res.json({ success: true, redirect: "/", displayData: req.session.displayData });
    
        } catch (error) {
            console.error("❌ Error saving timetable:", error);
            res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    }
             
};
