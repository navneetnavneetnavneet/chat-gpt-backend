const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const vectorService = require("../services/vector.service");
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
      const [userMessage, userMessageVector] = await Promise.all([
        messageModel.create({
          content: messagePayload.content,
          chat: messagePayload.chat,
          user: socket.user._id,
          role: "user",
        }),
        aiService.generateVector(messagePayload.content),
      ]);

      await vectorService.createMemory({
        vectors: userMessageVector,
        metadata: {
          userId: socket.user._id,
          chatId: messagePayload.chat,
          text: messagePayload.content,
        },
        messageId: userMessage._id,
      });

      const [memory, chatHistory] = await Promise.all([
        vectorService.queryMemory({
          queryVector: userMessageVector,
          limit: 5,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((history) => history.reverse()),
      ]);

      const longTermMemory = [
        {
          role: "user",
          parts: [
            {
              text: `
          These are some previous messages from the chat, use them to generate a response.
          ${memory.map((item) => item.metadata.text).join("\n")}
          `,
            },
          ],
        },
      ];

      const sortTermMemory = chatHistory.map((chatItem) => {
        return {
          role: chatItem.role,
          parts: [{ text: chatItem.content }],
        };
      });

      // console.log(memory);
      // console.log(longTermMemory[0]);
      // console.log(sortTermMemory);

      const response = await aiService.generateResponse([
        ...longTermMemory,
        ...sortTermMemory,
      ]);

      socket.emit("ai-response", response);

      const [modelMessage, modelMessageVector] = await Promise.all([
        messageModel.create({
          content: response,
          chat: messagePayload.chat,
          user: socket.user._id,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);

      await vectorService.createMemory({
        vectors: modelMessageVector,
        metadata: {
          userId: socket.user._id,
          chatId: messagePayload.chat,
          text: response,
        },
        messageId: modelMessage._id,
      });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  return io;
};
