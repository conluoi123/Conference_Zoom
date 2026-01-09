"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.meetingSocketHandler = void 0;
const chat_services_1 = require("../../services/chat.services");
const room_services_1 = require("../../services/room.services");
const session_services_1 = require("../../services/session.services");
const notification_services_1 = require("../../services/notification.services");
const meetingSocketHandler = (io, socket) => {
    socket.on("meeting:join", (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, participantName }) {
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
        const chat = yield (0, chat_services_1.getChat)(roomId);
        console.log(chat);
        socket.emit("meeting:chat-history", chat);
    }));
    //Nhắn tin trong phòng họp
    socket.on("meeting:chat", ({ roomId, participantId, participantName, content, avatar }) => {
        console.log(`${participantName} vừa chat "${content}" trong phòng họp ${roomId}`);
        const newMessage = {
            avatar: avatar,
            participantName: participantName,
            participantId: participantId,
            content: content,
            timestamp: new Date(Date.now()),
        };
        io.to(roomId).emit("meeting:chat", newMessage);
        (0, chat_services_1.insertNewMessage)(roomId, newMessage);
    });
    //Chỉnh sửa settings cho phòng họp
    socket.on("meeting:settings", ({ roomId, participantId, settings }) => {
        if (!(0, room_services_1.isHost)(roomId, participantId)) {
            console.log("Truy cập không xác định");
            socket.disconnect();
        }
        (0, room_services_1.updateRoomOnDatabase)(roomId, participantId, null, settings, null);
    });
    //Mời khi đang họp
    socket.on("meeting:invite", ({ roomId, participantId, emails }) => {
        console.log("📨 [DEBUG] Nhận sự kiện 'meeting:invite'");
        if (!(0, room_services_1.isHost)(roomId, participantId)) {
            console.log("Truy cập không xác định");
            socket.disconnect();
        }
        emails.forEach((email) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(roomId);
            (0, session_services_1.addInvitee)(roomId, email);
            const message = yield (0, notification_services_1.generateMeetingMessage)(roomId, participantId);
            const notification = yield (0, notification_services_1.createNotification)(email, `meeting-${roomId}`, message);
            const { type, content, isRead, sentAt } = notification;
            io.to(email).emit("notification:meeting", {
                type,
                content,
                isRead,
                sentAt,
            });
            console.log(`   - ✅ Đã bắn sự kiện 'notification:meeting' tới ${email}`);
        }));
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
exports.meetingSocketHandler = meetingSocketHandler;
//# sourceMappingURL=meeting.js.map