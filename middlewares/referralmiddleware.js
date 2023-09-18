const User = require("../model/userModel");

const referralChecker = async (req, res, next) => {
  try {
    if (req.body.referral) {
      const refUser = await User.findOne({ referralcode: req.body.referral });
      if (refUser) {
        refUser.referralpoints++;
        await refUser.save();
        next();
      } else {
        res.status(401).json("Invalid Referral Code");
      }
    } else {
      next();
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = { referralChecker };
