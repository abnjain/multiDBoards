const express = require("express");
const router = express.Router();
const { displayBoard, updateBoard, saveCurrentDisplay } = require("../controllers/boardController");
const isLoggedIn = require("../middlewares/isLoggedIn");

router.get("/board", isLoggedIn, displayBoard);
router.post("/update-board", isLoggedIn, updateBoard);
router.post("/save-current-display", isLoggedIn, saveCurrentDisplay);

module.exports = router;
