const express = require('express');
const router = express.Router();
const { displayBoard, updateBoard } = require("../controllers/boardController");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.get("/board", isLoggedIn, displayBoard);

// Route to update a display board's message
router.post("/update-board", isLoggedIn, updateBoard);



// // Route to fetch a specific board's details
// router.get("/currentDisplay/:id", isLoggedIn, currentDisplay);


module.exports = router;