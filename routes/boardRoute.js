const express = require("express");
const router = express.Router();
const { displayBoard, updateBoard, saveCurrentDisplay, addBoard, saveNewBoard, showMessageForm, showMessage, updateTimetableForm, updateTimetable } = require("../controllers/boardController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

router.get("/board/:dBoardId", isLoggedIn, displayBoard);
router.post("/update-board/:dBoardId", isLoggedIn, updateBoard);
router.post("/save-current-display", isLoggedIn, saveCurrentDisplay);

// router.get('/show-message/:boardId', isAdmin, showMessageForm);
// router.post('/show-message/:boardId', isAdmin, showMessage);

// router.get('/update-timetable/:boardId', isAdmin, updateTimetableForm);
// router.post('/update-timetable/:boardId', isAdmin, updateTimetable);

router.get("/add-board", isLoggedIn, isAdmin, addBoard);
router.post("/save-new-board", isLoggedIn, isAdmin, saveNewBoard);

module.exports = router;
