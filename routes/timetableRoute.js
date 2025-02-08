const express = require('express');
const router = express.Router();
const { viewTT, saveTT, updateTT } = require("../controllers/timetableController");
const isLoggedIn = require('../middlewares/isLoggedIn');

// Time Table Route
router.get("/view-timetable", isLoggedIn, viewTT);

// Save timetable API
router.post("/save-timetable", isLoggedIn, saveTT);

// Update individual cell in timetable (New)
router.post("/update-timetable", isLoggedIn, updateTT);

module.exports = router;