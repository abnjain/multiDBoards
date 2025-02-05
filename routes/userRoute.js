const express = require('express');
const router = express.Router();
const { login, logout } = require("../controllers/userController");
const isLoggedIn = require("../middlewares/isLoggedIn");
// const authenticateToken = require("../middlewares/authenticateToken");
// const refreshTokenRouter = require('../controllers/refreshToken');

// router.post("/register", register);
router.post("/login", login);
router.get("/logout", isLoggedIn, logout);

// router.use("/refresh", refreshTokenRouter);

module.exports = router;
