import session from "express-session";
import express from "express";
import path from "path";

//SocketIO and WebRTC
import { createServer } from "http";
import { Server } from "socket.io";

//middlewares
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";


//configs
import { ENV } from "./configs/env";
import { connectDB } from "./configs/db";
import roomRoutes from "./routes/room.routes";
import webHook from "./routes/webhook.routes";
import { userRoutes } from "./routes/user.routes";
import {
  outlookSignInRouter,
  sendOtpRouter,
  signInRouter,
  verifyOtpRouter,
} from "./routes/signIn.routes";
import { socketHandler } from "./socket/socketHandler";
import { refreshTokenRouter } from "./routes/refreshAccessToken.routes";
import logoutRouter from "./routes/logout.routes";

const PORT = ENV.PORT || 8080;
const app = express();
app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(cookieParser());
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

socketHandler(io);

//middlewares

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(
  session({
    name: "connect.sid",
    secret: ENV.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 60 * 1000,
    },
  })
);

signInRouter(app);
sendOtpRouter(app);
verifyOtpRouter(app);
outlookSignInRouter(app);

userRoutes(app);
roomRoutes(app);
refreshTokenRouter(app);
logoutRouter(app);
webHook(app);

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
