const express = require("express");
const router = express.Router();
const { displayBoard, updateBoard, saveCurrentDisplay, addBoard, saveNewBoard } = require("../controllers/boardController");
const isLoggedIn = require("../middlewares/isLoggedIn");
const isAdmin = require("../middlewares/isAdmin");

router.get("/board", isLoggedIn, displayBoard);
router.post("/update-board", isLoggedIn, updateBoard);
router.post("/save-current-display", isLoggedIn, saveCurrentDisplay);

router.get("/add-board", isLoggedIn, isAdmin, addBoard);
router.post("/save-new-board", isLoggedIn, isAdmin, saveNewBoard);

module.exports = router;
