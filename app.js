const { configDotenv } = require("dotenv");
const express = require("express");
const app = express();
const path = require("path");

require('dotenv').config();

const port = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const displayData = {
    title: "Cloud IoT Display Board",
    message: "Welcome to Smart Display!",
    lastUpdated: new Date().toLocaleString(),
  };


app.get("/", (req, res, next)=>{
    res.render("index", { displayData });
})



app.listen(port, ()=>{
    console.log(`Server is running on http://localhost:${port}`);
    
});