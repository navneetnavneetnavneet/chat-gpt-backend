const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

module.exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
      title,
      user: user._id,
    });

    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ message: "Chat is not created" });
  }
};

module.exports.fectchAllChat = async (req, res) => {
  try {
    const chats = await chatModel.find({ user: req.user._id });
    res.status(200).json(chats);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error !" });
  }
};

module.exports.fetchChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chatMessages = await messageModel.find({ chat: chatId });

    res.status(200).json(chatMessages);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error !" });
  }
};
