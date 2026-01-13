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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketHandler = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const meeting_1 = require("./events/meeting");
const notification_1 = require("./events/notification");
const agenda_1 = __importDefault(require("../configs/agenda"));
const room_services_1 = require("../services/room.services");
const recording_services_1 = require("../services/recording.services");
const notification_services_1 = require("../services/notification.services");
let io = null;
const initSocket = (httpServer) => {
    io = new socket_io_1.Server(httpServer, {
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
exports.initSocket = initSocket;
const socketHandler = (io) => {
    io.on("connection", (socket) => {
        try {
            console.log(`Socket connected: ${socket.id}`);
            //Khi người dùng đăng nhập tạo kết nối socket đến phòng là email của mình để có thể nhận thông báo
            const userEmail = socket.handshake.query.email;
            if (userEmail) {
                socket.join(userEmail);
                console.log(`${userEmail} đã kết nối (socket: ${socket.id})`);
            }
            else {
                console.warn(`${socket.id} kết nối mà không có email trong query`);
            }
            (0, meeting_1.meetingSocketHandler)(io, socket);
            (0, notification_1.notificationSocketHandler)(io, socket, agenda_1.default);
            //Thông báo khi được chia sẻ bản ghi
            socket.on("recording:share", (userId, roomId, sessionId, emails) => __awaiter(void 0, void 0, void 0, function* () {
                const hostCheck = yield (0, room_services_1.isHost)(roomId, userId);
                if (!hostCheck) {
                    console.log("Truy cập không xác định");
                    socket.disconnect();
                }
                (0, recording_services_1.shareRecording)(sessionId, emails);
                emails.forEach((email) => __awaiter(void 0, void 0, void 0, function* () {
                    const message = `Bạn được chia sẻ bản ghi cho cuộc họp:${roomId}`;
                    const notification = yield (0, notification_services_1.createNotification)(email, `recording-${sessionId}`, message);
                    const { type, content, isRead, sentAt } = notification;
                    io.to(email).emit("notification:recording", {
                        type,
                        content,
                        isRead,
                        sentAt,
                    });
                }));
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
};
exports.socketHandler = socketHandler;
const getIO = () => {
    if (!io) {
        throw new Error("Không tìm thấy kết nối Socket");
    }
    return io;
};
exports.getIO = getIO;
