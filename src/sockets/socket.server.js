const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");

module.exports.initSocketServer = (httpServer) => {
  const io = new Server(httpServer);

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    if (!cookies.token) {
      return next(new Error("Unauthorized user, No token found !"));
    }

    try {
      const decoded = await jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded._id);
      socket.user = user;

      next();
    } catch (error) {
      return next(new Error("Unauthorized user, Invalid token !"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      await messageModel.create({
        content: messagePayload.content,
        chat: messagePayload.chat,
        user: socket.user._id,
        role: "user",
      });

      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();

      const response = await aiService.generateResponse(
        chatHistory.map((chatItem) => {
          return {
            role: chatItem.role,
            parts: [{ text: chatItem.content }],
          };
        })
      );

      await messageModel.create({
        content: response,
        chat: messagePayload.chat,
        user: socket.user._id,
        role: "model",
      });

      socket.emit("ai-response", response);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  return io;
};
