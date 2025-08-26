const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const chatGptIndex = pc.Index("chat-gpt");

module.exports.createMemory = async ({ vectors, metadata, messageId }) => {
  await chatGptIndex.upsert([
    {
      id: messageId,
      values: vectors,
      metadata: metadata,
    },
  ]);
};

module.exports.queryMemory = async ({ queryVector, limit = 5, metadata }) => {
  const data = await chatGptIndex.query({
    vector: queryVector,
    topK: limit,
    filter: metadata ? metadata : undefined,
    includeMetadata: true,
  });

  return data.matches;
};
