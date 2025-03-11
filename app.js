const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const { get, child } = require("firebase/database");

// require("./config/mongoDB");
const { usersRef, displaysRef, timetableRef } = require("./config/firebase");
require("dotenv").config();

const port = process.env.PORT || 3000;
// = require("./config/firebase");

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }, // use secure cookies in production
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    })
}));

// Use cookie-parser before routes
app.use(cookieParser());

// Middleware to check if user is logged in
const isLoggedIn = require("./middlewares/isLoggedIn");

// Routes
const userRouter = require("./routes/userRoute");
const boardRouter = require("./routes/boardRoute");
const timetableRouter = require("./routes/timetableRoute");

// Set view engine
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({extended:true}));


// Routing to different routes
app.use("/auth", userRouter);
app.use("/board", boardRouter);
app.use("/tt", timetableRouter);

// Login route
app.get("/login", (req, res) => {
    res.render("login", { title: "Display Boards" });
});

app.get("/", isLoggedIn, async (req, res) => {
    const displayData = req.session.displayData || {
        title: "Cloud IoT Display Board",
        message: "Welcome to Smart Display!",
        lastUpdated: new Date().toLocaleString()
    };

    try {
        let displayRef = {};
        const displaySnapshot = await get(displaysRef); // Use get() for Firebase Realtime Database
        if (displaySnapshot.exists()) {
            displayRef = displaySnapshot.val();
        }

        let timetableRefData = {};
        const timetableSnapshot = await get(timetableRef); // Use get() instead of once()
        if (timetableSnapshot.exists()) {
            timetableRefData = timetableSnapshot.val();
        }

        res.render("index", { displayData, displayRef, timetableRef: timetableRefData, userId: req.session.userId });
    } catch (error) {
        console.error("Error fetching displayRef:", error);
        res.render("index", { displayData, displayRef: {}, timetableRef: {}, userId: req.session.userId });
    }
});


app.listen(port, ()=>{
    console.log(`Server is running on PORT: ${port}`);
});