import { Server, Socket } from "socket.io";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`New Connection: ${socket.id}`);

    //Vào phòng
    socket.on("join-room", ({ roomId, peerId, name }) => {
      // Gom socket này vào một nhóm ảo tên là 'roomId'
      socket.join(roomId);

      console.log(`User ${name} (${peerId}) đã vào phòng socket: ${roomId}`);

      // socket.to(roomId) nghĩa là gửi cho mọi người trừ người gửi
      socket.to(roomId).emit("user-joined", { peerId, name });
    });

    //Chat
    socket.on("send-message", (data) => {
      const { roomId, content, senderName } = data;

      // Kiểm tra xem user có thực sự ở trong phòng đó không (để bảo mật)
      if (socket.rooms.has(roomId)) {
        // Gửi lại tin nhắn cho mọi người trong phòng đó (bao gồm cả người gửi)
        io.to(roomId).emit("receive-message", {
          ...data,
          createdAt: new Date(),
        });
      } else {
        console.warn(
          `User ${socket.id} gửi tin vào phòng ${roomId} mà chưa join!`
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
      // Socket.IO tự động remove user khỏi tất cả các room khi disconnect
    });
  });
};
