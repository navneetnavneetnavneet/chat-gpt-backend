const userModel = require("../models/user.model");
const blacklistTokenModel = require("../models/blacklistToken.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

<<<<<<< HEAD
module.exports.logoutUserUser = async (req, res) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];
    res.clearCookie("token");

    await blacklistTokenModel.create(token);

    res.status(200).json({ message: "User logout successfully" });
  } catch (error) {
    return res.status(500).json({ message: "User is not logout !" });
  }
};

module.exports.loggedInUserUser = async (req, res) => {
=======
module.exports.loggedInUser = async (req, res) => {
>>>>>>> b9e3f2d4960e0823eec639892d9f8a38ad625201
  try {
    const user = await userModel.findById(req.user._id);

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized !" });
  }
};
