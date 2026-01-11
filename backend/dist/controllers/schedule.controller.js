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
exports.getScheduleById = exports.getListSchedule = exports.getUpcomingSchedules = void 0;
exports.createSchedule = createSchedule;
exports.getListScheduleByHostId = getListScheduleByHostId;
exports.updateSchedule = updateSchedule;
const schedule_services_1 = require("../services/schedule.services");
const schedule_model_1 = __importDefault(require("../models/schedule.model"));
const room_services_1 = require("../services/room.services");
const notification_services_1 = require("../services/notification.services");
const socketHandler_1 = require("../socket/socketHandler");
const invitation_services_1 = require("../services/invitation.services");
const agenda_1 = __importDefault(require("../configs/agenda"));
function createSchedule(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { hostId, roomId, title, startTime, duration, emails } = req.body;
            if (!hostId || !title || !startTime || !duration) {
                return res.status(400).json({ message: "Missing required fields" });
            }
            let room = "";
            if (roomId === "") {
                room = yield (0, room_services_1.createRoomOnVideoSDK)();
                yield (0, room_services_1.createRoomOnDatabase)({
                    roomId: room,
                    peerId: hostId,
                    title,
                    meetingType: "schedule",
                });
            }
            else {
                const isExistRoom = yield (0, room_services_1.findRoomOnDatabase)(roomId);
                if (!isExistRoom) {
                    return res.status(404).json({ message: "Room is not exists" });
                }
                room = roomId;
                yield (0, room_services_1.updateRoomOnDatabase)(room, hostId, title, null, null);
            }
            //Tạo phòng mới
            //Tạo lịch mới
            const schedule = yield (0, schedule_services_1.createScheduleOnDb)(hostId, room, title, startTime, null, duration);
            if (!schedule) {
                return res.status(500).json({ message: "Failed to create schedule" });
            }
            /**Về lịch hẹn
             * Bên muốn tạo lịch phải trước thời gian họp là 30p
             * Lời mời chỉ có hạn đến trước lịch họp là 15p
             */
            //Tạo thông báo
            const expires = new Date(startTime);
            expires.setMinutes(expires.getMinutes() - 15); // Lùi lại 15 phút
            //Tạo job thông báo cho người tạo lịch
            const hostEmail = yield (0, room_services_1.getHostEmail)(hostId);
            const uniqueJobId = `schedule_noti_${schedule._id}_${hostEmail}`;
            yield agenda_1.default.cancel({
                name: "onScheduleNotification",
                "data.uniqueJobId": uniqueJobId,
            });
            yield agenda_1.default.schedule(expires, "onScheduleNotification", {
                schedule,
                email: hostEmail,
                uniqueJobId,
            });
            const message = yield (0, notification_services_1.generateInvitationMessage)(room, hostId);
            emails.forEach((email) => __awaiter(this, void 0, void 0, function* () {
                const id = yield (0, invitation_services_1.createInvitation)(schedule._id, room, email, expires); //Tạo lời mời
                const notification = yield (0, notification_services_1.createNotification)(email, `invitation-${id}`, message); //Tạo thông báo
                const { type, content, isRead, sentAt } = notification;
                //Bắn thông báo
                const io = (0, socketHandler_1.getIO)();
                io.to(email).emit("notification:invitations", {
                    type,
                    content,
                    isRead,
                    sentAt,
                });
            }));
            return res.status(200).json({ schedule });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    });
}
function getListScheduleByHostId(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({
                    message: "userId is not found",
                });
            }
            const listSchedule = yield schedule_model_1.default.find({
                hostId: userId,
                startTime: { $gte: new Date() },
                $or: [{ endTime: null }, { endTime: { $gt: new Date() } }],
            });
            return res.status(200).json({
                listSchedule,
            });
        }
        catch (error) {
            console.error("getListSchedule error:", error);
            return res.status(500).json({
                message: "Internal server error",
            });
        }
    });
}
function updateSchedule(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const { scheduleId, title, startTime, endTime, duration, emails } = req.body;
            const updatedSchedule = yield (0, schedule_services_1.updateScheduleOnDb)(scheduleId, title, startTime, endTime, duration);
            if (!updatedSchedule) {
                return res.status(404).json({ message: "Schedule not found" });
            }
            const expires = new Date(startTime);
            expires.setMinutes(expires.getMinutes() - 15);
            const existsInvitedUser = yield (0, room_services_1.getRoomSheduleInvited)(updatedSchedule.roomId, updatedSchedule.hostId);
            const invitedList = (_a = existsInvitedUser === null || existsInvitedUser === void 0 ? void 0 : existsInvitedUser.invited) !== null && _a !== void 0 ? _a : [];
            const message = yield (0, notification_services_1.generateInvitationMessage)(updatedSchedule.roomId, updatedSchedule.hostId);
            for (const email of emails) {
                if (!invitedList.includes(email)) {
                    const id = yield (0, invitation_services_1.createInvitation)(scheduleId, updatedSchedule.roomId, email, expires);
                    const notification = yield (0, notification_services_1.createNotification)(email, `invitation-${id}`, message);
                    const { type, content, isRead, sentAt } = notification;
                    const io = (0, socketHandler_1.getIO)();
                    io.to(email).emit("notification:invitations", {
                        type,
                        content,
                        isRead,
                        sentAt,
                    });
                }
            }
            return res.status(200).json({
                message: "Schedule updated successfully",
                schedule: updatedSchedule,
            });
        }
        catch (error) {
            console.error("Update schedule error:", error);
            if (!res.headersSent) {
                return res.status(500).json({ message: "Internal server error" });
            }
        }
    });
}
const getUpcomingSchedules = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        const start = new Date();
        const now = new Date(start.getFullYear(), start.getMonth(), start.getDate(), 0, 0, 0, 0);
        const threeDaysLater = new Date();
        threeDaysLater.setDate(now.getDate() + 3);
        // rooms user được mời
        const invitedRooms = yield (0, room_services_1.getRoomShedule)(userId, "roomId");
        const invitedRoomIds = invitedRooms.map((r) => String(r.roomId));
        // schedules user được mời
        const invitedSchedules = yield schedule_model_1.default.find({
            roomId: { $in: invitedRoomIds },
            startTime: { $gte: now, $lte: threeDaysLater },
            $or: [{ endTime: null }, { endTime: { $gt: now } }],
        });
        // schedules user là host
        const hostSchedules = yield schedule_model_1.default.find({
            hostId: userId,
            startTime: { $gte: now, $lte: threeDaysLater },
            $or: [{ endTime: null }, { endTime: { $gt: now } }],
        });
        const unique = new Map();
        [...invitedSchedules, ...hostSchedules].forEach((s) => unique.set(String(s._id), s));
        const schedules = [...unique.values()].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        return res.status(200).json({
            success: true,
            schedules,
        });
    }
    catch (error) {
        console.error("getUpcomingSchedules error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getUpcomingSchedules = getUpcomingSchedules;
const getListSchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: "userId is required" });
        }
        const today = new Date();
        // ---- mốc thời gian ----
        const oneMonthAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
        const oneMonthLater = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);
        // rooms user được mời
        const invitedRooms = yield (0, room_services_1.getRoomShedule)(userId, "roomId");
        const invitedRoomIds = invitedRooms.map((r) => String(r.roomId));
        // schedules user được mời
        const invitedSchedules = yield schedule_model_1.default.find({
            roomId: { $in: invitedRoomIds },
            startTime: { $gte: oneMonthAgo, $lte: oneMonthLater },
            $or: [{ endTime: null }, { endTime: { $gt: oneMonthAgo } }],
        });
        // schedules user là host
        const hostSchedules = yield schedule_model_1.default.find({
            hostId: userId,
            startTime: { $gte: oneMonthAgo, $lte: oneMonthLater },
            $or: [{ endTime: null }, { endTime: { $gt: oneMonthAgo } }],
        });
        // ---- loại trùng ----
        const unique = new Map();
        [...invitedSchedules, ...hostSchedules].forEach((s) => unique.set(String(s._id), s));
        const schedules = [...unique.values()].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        return res.status(200).json({
            success: true,
            schedules,
        });
    }
    catch (error) {
        console.error("getUpcomingSchedules error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getListSchedule = getListSchedule;
const getScheduleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schedule = yield (0, schedule_services_1.getSchedule)(req.params.scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule not found" });
        }
        return res.status(200).json({ schedule });
    }
    catch (error) {
        console.error("Get Schedule error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getScheduleById = getScheduleById;
