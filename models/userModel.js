const mongoose = require('mongoose');
const { generateHash } = require("../utils/bcrypt");
// const dbgr = require("debug")("development:chessGame/userModel");

const UserSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: false,
    unique: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userImage: {
    type: String,
  },
  dob: {
    type: Date,
  },
  age: {
    type: Number,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String
  },
}, { timestamps: true });


UserSchema.pre('save', async function (next) {
  try {
    generateHash(this.password);
    next();
} catch (error) {
  next(error);
}
});

// UserSchema.post('save', function(error, doc, next) {
//   if (error.name === 'MongoError' && error.code === 11000) {
//     next(new Error('There was a duplicate key error'));
//   } else {
//     next(error);
//   }
// });

module.exports = mongoose.model('User', UserSchema);