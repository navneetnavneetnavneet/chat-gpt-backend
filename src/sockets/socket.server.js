const { Server } = require("socket.io");

module.exports.initSocketServer = (httpServer) => {
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    console.log("New socket connection");

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  return io;
};
