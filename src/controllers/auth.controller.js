const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client();

module.exports.loginWithGoogle = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required !" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name, given_name, family_name } = ticket.getPayload();

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        email,
        fullName: {
          firstName: given_name,
          lastName: family_name,
        },
      });

      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

      res.cookie("token", token);

      res.status(201).json({
        message: "User registered successfully",
        user,
      });
    } else {
      const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

      res.cookie("token", token);

      res.status(200).json({
        message: "User login successfully",
        user,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error !" });
  }
};

module.exports.registerUser = async (req, res) => {
  try {
    const {
      fullName: { firstName, lastName },
      email,
      password,
    } = req.body;

    const isUserAlreadyExist = await userModel.findOne({ email });

    if (isUserAlreadyExist) {
      return res
        .status(400)
        .json({ message: "User already registered, Please login !" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      fullName: { firstName, lastName },
      email,
      password: hashedPassword,
    });

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "User is not created !" });
  }
};

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password !" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password !" });
    }

    const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.cookie("token", token);

    res.status(200).json({
      message: "User loggedIn successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json("User in not loggedIn !");
  }
};

module.exports.logoutUserUser = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    res.clearCookie("token");

    await blacklistTokenModel.create({ token });

    res.status(200).json({ message: "User logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: "User is not logout !" });
  }
};

module.exports.loggedInUserUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized !" });
  }
};
