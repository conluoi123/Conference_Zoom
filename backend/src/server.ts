//Nodejs express
import session from "express-session";
import express from "express";

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
import { initSocket, socketHandler } from "./socket/socketHandler";
import { refreshTokenRouter } from "./routes/refreshAccessToken.routes";
import logoutRouter from "./routes/logout.routes";
import { supportProfileRouter } from "./routes/supportProfile.routes";
import notificationRoutes from "./routes/notification.routes";
import agenda, { startAgenda } from "./configs/agenda";
import scheduleRouter from "./routes/schedule.routes";
import { recordingRoutes } from "./routes/recording.routes";

const PORT = ENV.PORT || 10000;
const app = express();

app.use(
  cors({
    origin: ENV.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);
app.use(cookieParser());
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

const server = createServer(app);
const io = initSocket(server);

//Khởi động agenda
startAgenda();

socketHandler(io);

//Login - Logout
signInRouter(app);
sendOtpRouter(app);
verifyOtpRouter(app);
outlookSignInRouter(app);
logoutRouter(app);

//Authenticate Token
refreshTokenRouter(app);

//App
userRoutes(app);
roomRoutes(app);
recordingRoutes(app);
webHook(app);
supportProfileRouter(app);
notificationRoutes(app);
scheduleRouter(app);

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

//Tat agenda tranh tinh trang treo
const graceful = async () => {
  await agenda.stop();
  server.close(() => {
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);
