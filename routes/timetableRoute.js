const express = require('express');
const router = express.Router();
const { viewTT, getTimetableByClass, getTimetableByClassAndDay, saveTT, updateTT } = require("../controllers/timetableController");
const isLoggedIn = require('../middlewares/isLoggedIn');

// Time Table Route
router.get("/view-timetable", isLoggedIn, viewTT);

// API to get timetable for a specific class
router.get("/get-timetable/:className", isLoggedIn, getTimetableByClass);


// API to get timetable for a selected class and day
router.get("/get-timetable/:className/:day", isLoggedIn, getTimetableByClassAndDay);

// Save timetable API
router.post("/save-timetable", isLoggedIn, saveTT);

// Update individual cell in timetable (New)
router.post("/update-timetable", isLoggedIn, updateTT);

module.exports = router;