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
exports.getInvitationStatusByNotification = exports.markNotificationAsRead = exports.getNotifications = exports.generateInvitationMessage = exports.generateMeetingMessage = exports.createNotification = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const room_model_1 = __importDefault(require("../models/room.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const invitation_services_1 = require("./invitation.services");
const createNotification = (email, type, message) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.create({
        recipient: email,
        type: type,
        content: message,
        isRead: false,
        sentAt: new Date(),
    });
    if (!notification) {
        throw new Error("Lỗi tạo thông báo");
    }
    return notification;
});
exports.createNotification = createNotification;
const generateMeetingMessage = (roomId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, room] = yield Promise.all([
        user_model_1.default.findOne({ _id: participantId }),
        room_model_1.default.findOne({ roomId: roomId }),
    ]);
    if (!user || !room) {
        return "Bạn được mời tham gia phòng họp";
    }
    const message = `${user.displayName} đã mời bạn tham gia phòng họp:${room.roomId}`;
    return message;
});
exports.generateMeetingMessage = generateMeetingMessage;
const generateInvitationMessage = (roomId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, room] = yield Promise.all([
        user_model_1.default.findOne({ _id: participantId }),
        room_model_1.default.findOne({ roomId: roomId }),
    ]);
    if (!user || !room) {
        return "Bạn được mời tham gia lịch họp";
    }
    const message = `${user.displayName} hẹn bạn tham gia lịch họp:${room.roomId}`;
    return message;
});
exports.generateInvitationMessage = generateInvitationMessage;
const getNotifications = (email_1, ...args_1) => __awaiter(void 0, [email_1, ...args_1], void 0, function* (email, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [notifications, total, unreadCount] = yield Promise.all([
        notification_model_1.default.find({ recipient: email })
            .sort({ sentAt: -1 })
            .skip(skip)
            .limit(limit),
        notification_model_1.default.countDocuments({ recipient: email }),
        notification_model_1.default.countDocuments({ recipient: email, isRead: false }),
    ]);
    return {
        notifications: notifications || [],
        total,
        unreadCount,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
});
exports.getNotifications = getNotifications;
const markNotificationAsRead = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
    if (!notification) {
        throw new Error("Notification not found");
    }
    return notification;
});
exports.markNotificationAsRead = markNotificationAsRead;
const getInvitationStatusByNotification = (notificationId) => __awaiter(void 0, void 0, void 0, function* () {
    const notification = yield notification_model_1.default.findById(notificationId);
    if (!notification) {
        throw new Error("Notification not found");
    }
    const status = yield (0, invitation_services_1.getInvitationStatus)(notification.type.split("-")[1]);
    return status;
});
exports.getInvitationStatusByNotification = getInvitationStatusByNotification;
//# sourceMappingURL=notification.services.js.map