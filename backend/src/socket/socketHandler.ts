import { Server, Socket } from "socket.io";
import { meetingSocketHandler } from "./events/meeting";
import { Server as httpServer } from "http";
import { notificationSocketHandler } from "./events/notification";
import agenda from "../configs/agenda";
import { isHost } from "../services/room.services";
import { shareRecording } from "../services/recording.services";
import { createNotification } from "../services/notification.services";

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
    try {
      console.log(`Socket connected: ${socket.id}`);

      //Khi người dùng đăng nhập tạo kết nối socket đến phòng là email của mình để có thể nhận thông báo
      const userEmail = socket.handshake.query.email as string;
      if (userEmail) {
        socket.join(userEmail);
        console.log(`${userEmail} đã join room email (socket: ${socket.id})`);
      } else {
        console.warn(`${socket.id} kết nối mà không có email trong query`);
      }

      meetingSocketHandler(io, socket);
      notificationSocketHandler(io, socket, agenda);

      //Thông báo khi được chia sẻ bản ghi
      socket.on(
        "recording:share",
        async (userId, roomId, sessionId, emails) => {
          if (!isHost(roomId, userId)) {
            console.log("Truy cập không xác định");
            socket.disconnect();
          }
          shareRecording(sessionId, emails);
          emails.forEach((email) => {
            const message = `Bạn được chia sẻ bản ghi cho cuộc họp ${roomId}`;
            createNotification(email, "recording", message);
            io.to(email).emit("notification:recording", {
              roomId,
              sessionId,
              message,
            });
          });
        }
      );
    } catch (error) {
      console.log(error);
    }
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Không tìm thấy kết nối Socket");
  }
  return io;
};

export { initSocket, getIO, socketHandler };
