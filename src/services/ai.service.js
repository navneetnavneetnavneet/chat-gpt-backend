const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

module.exports.generateResponse = async (content) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content,
  });

  return response.text;
};
