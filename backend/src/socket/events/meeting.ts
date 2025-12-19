import { Server, Socket } from "socket.io";
import Chat from "../../models/chat.model";
import { getChat, insertNewMessage } from "../../services/chat.services";
import { isHost, updateRoomOnDatabase } from "../../services/room.services";

export const meetingSocketHandler = (io: Server, socket: Socket) => {
  socket.on("meeting:join", async ({ roomId, participantName }) => {
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
    const chat = await getChat(roomId);
    console.log(chat);
    socket.emit("meeting:chat-history", chat);
  });

  socket.on(
    "meeting:chat",
    ({ roomId, participantId, participantName, content }) => {
      console.log(
        `${participantName} vừa chat "${content}" trong phòng họp ${roomId}`
      );

      const newMessage = {
        participantName: participantName,
        participantId: participantId,
        content: content,
        timestamp: new Date(Date.now()),
      };

      io.to(roomId).emit("meeting:chat", newMessage);

      insertNewMessage(roomId, newMessage);
    }
  );

  socket.on("meeting:settings", ({ roomId, participantId, settings }) => {
    if (!isHost(roomId, participantId)) {
      console.log("Truy cập không xác định");
      socket.disconnect();
    }
    updateRoomOnDatabase(roomId, participantId, null, settings, null);
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
      .emit("meeting:leave", `${participantName} đã rời khỏi phòng họp`);
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected`);
  });
};
