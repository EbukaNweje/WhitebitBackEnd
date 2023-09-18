const User = require("../model/userModel");
const { genToken, decodeToken } = require("../utilities/jwt");
const qrcode = require("qrcode");
const { authenticator } = require("otplib");
const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { otpAuth } = require("../utilities/authenticator");
const { generateDynamicEmail } = require("../utilities/emailTemplate");

const newuser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isEmail = await User.findOne({ email });
    if (isEmail) {
      res.status(409).json({
        message: "email already registerd",
      });
    } else {
      const salt = bcryptjs.genSaltSync(10);
      const hash = bcryptjs.hashSync(password, salt);
      const referralcode = uniqid.time();
      const user = await User.create({
        username,
        email: email.toLowerCase(),
        referralcode,
        password: hash,
      });
      const token = await genToken(user._id, "1d");
      const subject = "New User";
      const link = "";
      const html = await generateDynamicEmail(link, user.firstName);
      const data = {
        email: email,
        subject,
        html,
      };
      sendEmail(data);
      res.status(201).json({
        success: true,
        user,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user && !user.isVerified) {
      const token = await genToken(user._id, "1d");
      const subject = "New User";
      const link = ``;
      const html = await generateDynamicEmail(link, user.username);
      const data = {
        email: email,
        subject,
        html,
      };
      sendEmail(data);
      res.status(200).json({
        message: "verificaton email sent",
      });
    } else if (user?.isVerified) {
      res.status(200).json({
        message: "user already verified",
      });
    } else {
      res.status(404).json({
        message: "user with email not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    let checkPassword = false;
    if (user) {
      req.user = user;
      checkPassword = bcryptjs.compareSync(password, user.password);
      if (!checkPassword) {
        res.status(400).json({
          message: "invalid password",
        });
      } else if (!user.isVerified) {
        const token = await genToken(user._id, "1d");
        const subject = "verify now";
        const link = ``;
        const html = await generateDynamicEmail(link, user.username);
        const data = {
          email: email,
          subject,
          html,
        };
        sendEmail(data);
        res.status(401).json({
          message: "you are not verified check your email to verify",
        });
      } else {
        if (user.twofa.enabled) {
          const verified = await otpAuth(req);
          if (verified) {
            user.isloggedin = true;
            const token = await genToken(user._id, "1d");
            await user.save();
            const userRes = await User.findById(user._id);
            const { username, email, twofa, referralcode } = userRes;
            res.status(200).json({
              user: {
                token,
                username,
                email,
                twofa,
                referralcode,
              },
            });
          } else {
            res.status(503).json({
              message:
                "Invalid OTP, two factor authentication for this user is required",
            });
          }
        } else {
          user.isloggedin = true;
          const token = await genToken(user._id, "1d");
          await user.save();
          const userRes = await User.findById(user._id);
          const { username, email, twofa, referralcode } = userRes;
          res.status(200).json({
            user: {
              token,
              username,
              email,
              twofa,
              referralcode,
            },
          });
        }
      }
    } else {
      res
        .status(400)
        .json({ message: "invalid email, please enter a registered email." });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const userVerify = async (req, res) => {
  try {
    const { token } = req.params;

    const userInfo = await decodeToken(token);

    if (userInfo) {
      await User.findByIdAndUpdate(userInfo._id, { isVerified: true });
      res.status(200).json({ message: "user verified" });
    } else {
      throw new Error("error verifying user, try again");
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    //create a link with the reset password link and send it to email
    const user = await User.findOne({ email });
    if (user) {
      const subject = "forgotten password";
      const token = await genToken(user._id, "30m");
      // for better security practice a unique token should be sent to reset password instead of user._id
      const link = ``;
      const html = await generatePasswordEmail(link, user.firstName);
      const data = {
        email: email,
        subject,
        html,
      };
      sendEmail(data);
      res.status(200).json({
        message: "Check your registered email for your password reset link",
      });
    } else {
      res.status(404).json({
        message: "user not found",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const resetpassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const salt = bcryptjs.genSaltSync(10);
    const hashedPassword = bcryptjs.hashSync(password, salt);
    const userInfo = await decodeToken(token);
    const user = await User.findByIdAndUpdate(userInfo._id, {
      password: hashedPassword,
    });
    if (user) {
      res.status(200).json({
        message: "password successfully reset",
      });
    } else {
      res.status(500).json({
        message: "error changing password",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const logout = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const blacklist = [];
    const hasAuthorization = req.headers.authorization;
    const token = hasAuthorization.split(" ")[1];
    blacklist.push(token);
    user.isloggedin = false;
    await user.save();
    res.status(200).json({ message: "logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

///2FA configurations

//send user qrImage
const qrimage = async (req, res) => {
  try {
    const { _id } = req.user;
    const user = await User.findById(_id);
    const secret = authenticator.generateSecret();
    const uri = authenticator.keyuri(user.email, "wallet-auth", secret);
    console.log(uri);
    console.log(secret);
    const image = await qrcode.toDataURL(uri);
    user.twofa.secret = secret;
    await user.save();
    res.status(200).json({
      success: true,
      image,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const enableTwoFactorAuth = async (req, res) => {
  try {
    const { _id } = req.user;
    //const { code } = req.body;
    const user = await User.findById(_id);
    const verified = await otpAuth(req);
    if (verified) {
      user.twofa.enabled = true;
      await user.save();
      res.status(200).json({
        message: "success",
      });
    } else {
      res.status(401).json({
        message: "invalid code, try again",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  newuser,
  signin,
  enableTwoFactorAuth,
  qrimage,
  userVerify,
  forgotPassword,
  resetpassword,
  resendEmailVerification,
};
