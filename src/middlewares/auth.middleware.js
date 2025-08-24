const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

module.exports.isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(400).json({ message: "Unauthorized !" });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(decoded);
    req.user = user;

    next();
  } catch (error) {
    return res.status(400).json({ message: "Unauthorized !" });
  }
};
