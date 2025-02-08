// Import Firebase config (initializes Firebase Admin SDK)
const { db, usersRef, displaysRef, timetableRef } = require("../config/firebase");

module.exports = {
    displayBoard: async (req, res) => {
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
    },

    updateBoard: async (req, res) => {
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
    },

    // currentDisplay: async (req, res) => {
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

}