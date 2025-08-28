const express = require("express");
const router = express.Router();
const authUser = require("../middlewares/auth.middleware");
const chatController = require("../controllers/chat.controller");

router.post("/", authUser.isAuthenticated, chatController.createChat);

router.get("/", authUser.isAuthenticated, chatController.fectchAllChat);

router.get("/messages/:chatId", authUser.isAuthenticated, chatController.fetchChatMessages);

module.exports = router;
