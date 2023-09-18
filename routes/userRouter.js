const express = require("express");
const {
  newuser,
  signin,
  enableTwoFactorAuth,
  qrimage,
  resetpassword,
  forgotPassword,
  userVerify,
  resendEmailVerification,
} = require("../controller/userController");
const { userAuth } = require("../middlewares/authmiddleware");
const { referralChecker } = require("../middlewares/referralmiddleware");
const { passwordMiddleware } = require("../middlewares/passwordvalidator");

const router = express.Router();

router.post("/new-user", referralChecker, newuser);
router.post("/login", signin);
router.put("/qrimage", userAuth, qrimage);
router.put("/enable2fa", userAuth, enableTwoFactorAuth);
router.put("/verify/:token", userVerify);
router.post("/forgot-password", forgotPassword);
router.get("/resend-email-verification", resendEmailVerification);
router.put("/reset-password/:token", passwordMiddleware, resetpassword);

module.exports = router;
