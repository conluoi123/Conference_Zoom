import express from "express";
import path from "path";

//SocketIO and WebRTC
import { createServer } from "http";
import { Server } from "socket.io";

//middlewares
import cors from "cors";
import morgan from "morgan";

//configs
import { ENV } from "./configs/env";
import { connectDB } from "./configs/db";
import roomRoutes from "./routes/room.routes";

const PORT = ENV.PORT || 8080;
const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 60000, // 60s gửi ping 1 lần
  pingTimeout: 3000, // timeout 3s nếu không pong lại -> disconnect
});

//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

roomRoutes(app);

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
