const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const authUser = require("../middlewares/auth.middleware");

router.post("/register", authController.registerUser);

router.post("/login", authController.loginUser);

<<<<<<< HEAD
router.get("/logout", authUser.isAuthenticated, authController.logoutUserUser);

router.get("/", authUser.isAuthenticated, authController.loggedInUserUser);
=======
router.get("/", authUser.isAuthenticated, authController.loggedInUser);
>>>>>>> b9e3f2d4960e0823eec639892d9f8a38ad625201

module.exports = router;
