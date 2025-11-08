import express from "express";
import path from "path";

//SocketIO and WebRTC
import http from "http";
import { Server } from "socket.io";

//middlewares
import cors from "cors";

//configs
import { ENV } from "./configs/env";
import { connectDB } from "./configs/db";

const app = express();
const PORT = ENV.PORT || 8080;

//middlewares

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    msg: "done",
  });
});

//Connect with frontend
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
