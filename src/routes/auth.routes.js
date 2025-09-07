const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authUser = require("../middlewares/auth.middleware");

router.post("/google", authController.loginWithGoogle);

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

router.get("/logout", authUser.isAuthenticated, authController.logoutUserUser);

router.get("/", authUser.isAuthenticated, authController.loggedInUserUser);

module.exports = router;
