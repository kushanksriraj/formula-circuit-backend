const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "Name is required!",
    text: true,
  },
  username: {
    type: String,
    trim: true,
    index: { unique: true },
    required: "username is required!",
    text: true,
  },
  email: {
    type: String,
    trim: true,
    index: { unique: true },
    required: "Email is required!"
  },
  bio: {
    type: String,
    trim: true,
    maxLen: 280,
  },
  profileURL: {
    type: String,
    maxLen: 150,
  },
  password: {
    type: String,
    trim: true,
    required: true
  },
  followingList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  followersList: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = { User };
