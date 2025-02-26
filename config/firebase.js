// firebase.js
const admin = require("firebase-admin");
require("dotenv").config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SECRETS);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
  });
}

const db = admin.database();

const displaysRef = db.ref("displayBoards"); // Define the reference to your Realtime Database
const usersRef = db.ref("users"); // Define the reference to your Realtime Database
const timetableRef = db.ref("timetable"); // Define the reference to your Realtime Database
const eventsRef = db.ref("events"); // Define the reference to your Realtime Database

module.exports = { admin, db, usersRef, displaysRef, timetableRef, eventsRef };
