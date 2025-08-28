const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

module.exports.generateResponse = async (content) => {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: content,
    config: {
      temperature: 0.7,
      systemInstruction: `
      
        Always format your answers Markdown format (jaise headings ##, code blocks "js") 
        in a clean and structured way:

      1. Use **Headings** (## Heading) to organize content.  
      2. Use short **paragraphs** for explanations.  
      3. Show any code inside proper fenced code blocks.  
      4. Use **bullet points or numbered lists** for steps.  
      5. Keep answers clear, beginner-friendly, and well-structured.  
      6. Add emojis 🎉💡🔥 where natural to make it engaging. 
      `,
    },
  });

  return response.text;
};

module.exports.generateVector = async (content) => {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: content,
    config: {
      outputDimensionality: 768,
    },
  });

  return response.embeddings[0].values;
};
