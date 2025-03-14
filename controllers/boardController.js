const { db, usersRef, displaysRef, timetableRef, eventsRef } = require("../config/firebase");

module.exports = {
    displayBoard: async (req, res) => {
        try {
            const { dBoardId } = req.params;
            const snapshot = await displaysRef.once("value");
            const displays = snapshot.val() || {};
            res.render("board", { displays, dBoardId });
        } catch (error) {
            console.error("Error fetching display boards:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    updateBoard: async (req, res) => {
        const { dBoardId } = req.params;
        const { message, date, startTime, endTime } = req.body;

        if (!message || !date || !startTime || !endTime) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        try {
            // Fetch existing board data to keep all key-value pairs
            const boardSnapshot = await displaysRef.child(dBoardId).once("value");
            const existingBoardData = boardSnapshot.val() || {}; // Get existing data or empty object

            // Define timeRange explicitly
            const timeRange = `${startTime} to ${endTime}`;
    
            const boardData = { 
                ...existingBoardData,
                boardID: dBoardId, 
                message, 
                date, 
                startTime, 
                endTime, 
                timeRange,
                lastUpdated: new Date().toISOString() 
            };
    
            // Update Firebase with the boardData object
            await displaysRef.child(dBoardId).update(boardData);
    
            // Fetch timetable data
            let timetableSnapshot = await timetableRef.once("value");
            let timetable = timetableSnapshot.val() || {};
    
            // If no event timetable exists, fetch from timetableRef
            timetableSnapshot = await timetableRef.once("value");
            timetable = timetableSnapshot.val();
            
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
                    : `Displaying Current Timetable on ${board.boardId}`,
                lastUpdated: new Date().toLocaleString()
            };
    
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
    },

    addBoard: (req, res) => {
        try {
            res.render("addNewBoard");
        } catch (error) {
            console.error("Error Adding New Display Board:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    saveNewBoard: async (req, res) => {
        try {
            const { boardId, title } = req.body;

            if (!boardId || !title) {
                return res.status(400).json({ success: false, message: "All fields are required" });
            }

            const newBoardId = `18122023A0${boardId}`;

            const newBoard = { boardId: newBoardId, title, lastUpdated: new Date().toISOString() };

            const boardSnapshot = await displaysRef.child(newBoardId).once("value");
            const boardData = boardSnapshot.val() || {}; // Get existing data or empty object

            if (Object.keys(boardData).length !== 0) {
                return res.json({ success: false, redirect: "/", message: "Board ID already exists" });
            }

            await displaysRef.child(newBoardId).set(newBoard);

            res.json({ success: true, redirect: "/", message: "New board added successfully", board: newBoard });
        } catch (error) {
            console.error("Error Adding New Display Board:", error);
            res.json({ success: false, redirect: "/", message: "Internal Server Error", error: error.message });
        }
    },

    showMessageForm: (req, res) => {
        const { boardId } = req.params;
        res.render('showMessageForm', { boardId });
    },

    showMessage: async (req, res) => {
        const { boardId } = req.params;
        const { message } = req.body;

        try {
            await displaysRef.child(boardId).update({ message, lastUpdated: new Date().toISOString() });
            res.redirect('/');
        } catch (error) {
            console.error("Error showing message on board:", error);
            res.status(500).send("Internal Server Error");
        }
    },

    updateTimetableForm: (req, res) => {
        const { boardId } = req.params;
        res.render('updateTimetableForm', { boardId });
    },

    updateTimetable: async (req, res) => {
        const { boardId } = req.params;
        const { timetable } = req.body;

        try {
            await timetableRef.child(boardId).set(timetable);
            res.redirect('/');
        } catch (error) {
            console.error("Error updating timetable:", error);
            res.status(500).send("Internal Server Error");
        }
    }
};
