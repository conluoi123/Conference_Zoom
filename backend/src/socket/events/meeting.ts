import { Server, Socket } from "socket.io";

interface Message {
  id: string;
  participantId: string;
  participantName: string;
  content: string;
  createdAt: Date;
}

export const meetingSocketHandler = (io: Server, socket: Socket) => {
  socket.on("meeting:join", ({ roomId, participantName }) => {
    /*
      Khi 1 participant vào phòng sẽ có webhook từ videoSDK trả về dữ liệu participant
      Xong sẽ thiết lập kết nối socketIO với người dùng.
      Vào socket phòng {roomId} với participantName
      Và thông báo đến cả phòng là có người tên gì vào phòng.
    */
    console.log(`${participantName} vừa tham gia phòng họp ${roomId}`);
    socket.join(roomId);
    socket
      .to(roomId)
      .emit("meeting:join", `${participantName} vừa tham gia phòng họp`);
  });

  socket.on(
    "meeting:chat",
    ({ roomId, participantId, participantName, content, createdAt }) => {
      console.log(
        `${participantName} vừa chat "${content}" trong phòng họp ${roomId}`
      );

      const newMessage: Message = {
        id: Date.now().toString(), // Ưu tiên ID từ server
        participantName: participantName,
        participantId: participantId,
        content: content,
        createdAt: new Date(Date.now()),
      };

      io.to(roomId).emit("meeting:chat", newMessage);

      // Còn tạo đối tượng chat lưu trong database
    }
  );

  socket.on("meeting:settings", ({ roomId, participantId }) => {
    /**Cập nhật settings cho phòng họp */
  });

  socket.on("meeting:invite", ({ roomId, participantId, email }) => {
    /**
     * Tạo lời mời và thông báo đến người dùng
     */
  });

  socket.on("meeting:leave", ({ roomId, participantName }) => {
    /**
     * Ngắt kết nối socket khỏi {roomId}
     */
    socket
      .to(roomId)
      .emit("meeting:join", `${participantName} đã rời khỏi phòng họp`);
    socket.leave(roomId);
  });
};
