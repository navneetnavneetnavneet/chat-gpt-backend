const chatModel = require("../models/chat.model");

module.exports.createChat = async (req, res) => {
  try {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
      title,
      user: user._id,
    });

    res.status(201).json({
      message: "Chat created successfully",
      chat,
    });
  } catch (error) {
    res.status(500).json({ message: "Chat is not created" });
  }
};
