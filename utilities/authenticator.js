const User = require("../model/userModel");
const { authenticator } = require("otplib");

const otpAuth = async (req) => {
  const { _id } = req.user;
  const { code } = req.body;
  const user = await User.findById(_id);
  const verified = authenticator.check(code, user.twofa.secret);
  if (verified) {
    return true;
  } else {
    return false;
  }
};

module.exports = { otpAuth };
