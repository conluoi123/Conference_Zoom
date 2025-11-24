import express, { request } from "express";
import path from "path";

//SocketIO and WebRTC
import { createServer } from "http";
import { Server } from "socket.io";


//middlewares
import cors from "cors";
import morgan from "morgan";
import helmet from 'helmet'; 
import cookieParser from "cookie-parser"

//configs
import { ENV } from "./configs/env";
import { connectDB } from "./configs/db";
import roomRoutes from "./routes/room.routes";
import SignInRouter from "./routes/googleSignIn.routes";
import {sendOtpRouter, verifyOtpRouter} from "./routes/signIn.routes";
import { redisClient } from "./configs/redisUpstash";
import outlookSignInRouter from "./routes/outlookSignIn.router";

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
app.use(cookieParser());
// app.use(helmet());

roomRoutes(app);
SignInRouter(app);
sendOtpRouter(app);
verifyOtpRouter(app);
outlookSignInRouter(app);

//Connect with frontend
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend", "dist", "index.html"));
  });
}


const startServer = async () => {
  try {
    await redisClient;
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
export { io };
