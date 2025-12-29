import { Server, Socket } from "socket.io";
import { meetingSocketHandler } from "./events/meeting";
import { Server as httpServer } from "http";
import { notificationSocketHandler } from "./events/notification";
import agenda from "../configs/agenda";

let io: Server | null = null;

const initSocket = (httpServer: httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingInterval: 60000, // 60s gửi ping 1 lần
    pingTimeout: 3000, // timeout 3s nếu không pong lại -> disconnect
  });
  return io;
};

const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    const userEmail = socket.handshake.query.email as string;
    if (userEmail) {
      socket.join(userEmail);
      console.log(`${userEmail} đã join room email (socket: ${socket.id})`);
    } else {
      console.warn(`${socket.id} kết nối mà không có email trong query`);
    }
    meetingSocketHandler(io, socket);
    notificationSocketHandler(io, socket, agenda);
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Không tìm thấy kết nối Socket");
  }
  return io;
};

export { initSocket, getIO, socketHandler };
