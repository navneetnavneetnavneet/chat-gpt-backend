require("dotenv").config({
  path: "./.env",
});
const app = require("./src/app");
const connectDatabase = require("./src/db/db");
const http = require("http");
const { initSocketServer } = require("./src/sockets/socket.server");

const port = process.env.PORT || 3000;

const httpServer = http.createServer(app);

connectDatabase();
initSocketServer(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
