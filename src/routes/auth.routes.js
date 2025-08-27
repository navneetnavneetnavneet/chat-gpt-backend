const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authUser = require("../middlewares/auth.middleware");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/", authUser.isAuthenticated, authController.loggedInUser);

module.exports = router;
