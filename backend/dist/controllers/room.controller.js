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
exports.getInvietedUsersBySchedule = exports.userJoinRoom = exports.createNewRoom = void 0;
const room_services_1 = require("../services/room.services");
const session_services_1 = require("../services/session.services");
const schedule_services_1 = require("../services/schedule.services");
const createNewRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { peerId, title, meetingType } = req.body;
        const roomId = yield (0, room_services_1.createRoomOnVideoSDK)();
        yield (0, room_services_1.createRoomOnDatabase)({ roomId, peerId, title, meetingType });
        const token = (0, room_services_1.generateToken)("host", peerId, roomId);
        return res.status(200).json({ roomId, hostId: peerId, token });
    }
    catch (error) {
        console.error("Tạo phòng:", error.message);
        if (error.message.includes("Lỗi VideoSDK")) {
            return res.status(502).json({ error: error.message });
        }
        // Lỗi server/DB nói chung
        return res.status(500).json({ error: "Tạo phòng thất bại!" });
    }
});
exports.createNewRoom = createNewRoom;
const userJoinRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, peerId } = req.body;
        const room = res.locals.roomInfo;
        if (room.type === "SCHEDULED") {
            const schedule = yield (0, schedule_services_1.latestSchedule)(roomId);
            if (schedule[schedule.length - 1].hostId != peerId)
                if (!(0, schedule_services_1.isDueSchedule)(schedule))
                    return res.status(403).json("Chưa đến thời gian vào phòng họp");
        }
        let userType = "peer";
        if (peerId === room.hostId) {
            userType = "host";
        }
        else if ((yield (0, room_services_1.isInvitedForRoom)(roomId, peerId)) ||
            (yield (0, session_services_1.isInvitedForSession)(roomId, peerId)) ||
            room.settings.allowJoin) {
            userType = "invitee";
        }
        const token = (0, room_services_1.generateToken)(userType, peerId, roomId);
        return res
            .status(200)
            .json({ hostId: room.hostId, settings: room.settings, token: token });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json(error);
    }
});
exports.userJoinRoom = userJoinRoom;
const getInvietedUsersBySchedule = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, hostId } = req.body;
        if (!roomId || !hostId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        const isExistRoom = yield (0, room_services_1.findRoomOnDatabase)(roomId);
        if (!isExistRoom) {
            return res.status(404).json({ message: "Room is not exists" });
        }
        if (isExistRoom.hostId != hostId) {
            return res.status(403).json({ message: "You don't have permission to reschedule for this room" });
        }
        const invitedUsers = yield (0, room_services_1.getRoomSheduleInvited)(roomId, hostId);
        return res.status(200).json({ invitedUsers });
    }
    catch (error) {
        console.error("getInvietedUsersBySchedule error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getInvietedUsersBySchedule = getInvietedUsersBySchedule;
