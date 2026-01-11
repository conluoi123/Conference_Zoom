import { Server, Socket } from "socket.io";
import Chat from "../../models/chat.model";
import { getChat, insertNewMessage } from "../../services/chat.services";
import { isHost, updateRoomOnDatabase } from "../../services/room.services";
import { addInvitee } from "../../services/session.services";
import { create } from "domain";
import {
  createNotification,
  generateMeetingMessage,
} from "../../services/notification.services";
import { isAlreadyJoined } from "../../services/participant.services";

export const meetingSocketHandler = (io: Server, socket: Socket) => {
  socket.on("meeting:join", async ({ roomId, participantName }) => {
    try {
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
      socket.emit("meeting:chat-history", chat);
    } catch (error) {
      console.log(error);
    }
  });

  //Nhắn tin trong phòng họp
  socket.on(
    "meeting:chat",
    ({ roomId, participantId, participantName, content, avatar }) => {
      try {
        const newMessage = {
          avatar: avatar,
          participantName: participantName,
          participantId: participantId,
          content: content,
          timestamp: new Date(Date.now()),
        };

        io.to(roomId).emit("meeting:chat", newMessage);

        insertNewMessage(roomId, newMessage);
      } catch (error) {
        console.log(error);
      }
    }
  );

  //Chỉnh sửa settings cho phòng họp
  socket.on("meeting:settings", async ({ roomId, participantId, settings }) => {
    const hostCheck = await isHost(roomId, participantId);
    if (!hostCheck) {
      console.log("Truy cập không xác định");
      socket.disconnect();
      return;
    }

    // Lưu vào DB
    await updateRoomOnDatabase(roomId, participantId, null, settings, null);
    // Broadcast cho tất cả người trong phòng (kể cả host)
    io.to(roomId).emit("meeting:settings_updated", settings);
  });

  //Mời khi đang họp
  socket.on("meeting:invite", async ({ roomId, participantId, emails }) => {
    try {
      const hostCheck = await isHost(roomId, participantId);
      if (!hostCheck) {
        console.log("Truy cập không xác định");
        socket.disconnect();
      }
      emails.forEach(async (email) => {
        const isJoined = await isAlreadyJoined(roomId, email);
        if (!isJoined) {
          addInvitee(roomId, email);
          const message = await generateMeetingMessage(roomId, participantId);
          const notification = await createNotification(
            email,
            `meeting-${roomId}`,
            message
          );
          const { type, content, isRead, sentAt } = notification;
          io.to(email).emit("notification:meeting", {
            type,
            content,
            isRead,
            sentAt,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  });

  //Rời phòng họp
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
