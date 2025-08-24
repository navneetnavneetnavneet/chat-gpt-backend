const express = require("express");
const app = express();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
