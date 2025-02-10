const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);

// require("./config/mongoDB");
require("./config/firebase");
require("dotenv").config();

const port = process.env.PORT || 3000;

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

// Home route
app.get("/", isLoggedIn, (req, res) => {
    const displayData = req.session.displayData || {
        title: "Cloud IoT Display Board",
        message: "Welcome to Smart Display!",
        lastUpdated: new Date().toLocaleString()
    };
    console.log("🚀 Display Data:", displayData);
    
    res.render("index", { displayData, userId: req.session.userId });
});


app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
});