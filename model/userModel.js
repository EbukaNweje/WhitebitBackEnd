const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "username is required."],
    lowercase: true,
  },
  email: {
    type: String,
    require: [true, "email is required"],
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "password is required"],
  },
  referralcode: {
    type: String,
    required: [true, "referral code is required"],
    unique: true,
  },
  referralpoints: {
    type: Number,
    default: 0,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isloggedin: {
    type: Boolean,
    default: false,
  },
  balance: [
    {
      cryptoCurrencyType: String,
      balance: Number,
    },
  ],
  depositHistory: [
    {
      type: String,
    },
  ],
  twofa: {
    enabled: { type: Boolean, default: false },
    secret: { type: String, default: "" },
  },
});

const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
