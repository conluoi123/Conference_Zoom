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
exports.isAlreadyJoined = exports.getMeetingHistory = exports.onParticipantLeft = exports.onParticipantJoined = void 0;
const participant_model_1 = __importDefault(require("../models/participant.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const room_services_1 = require("./room.services");
const session_services_1 = require("./session.services");
const onParticipantJoined = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const participant = yield participant_model_1.default.findOneAndUpdate({
            sessionId: data.sessionId,
            participantId: data.participantId,
            roomId: data.meetingId,
        }, {
            $set: {
                leaveTime: null,
                displayName: data.participantName,
            },
            $setOnInsert: {
                joinTime: new Date(),
            },
        }, {
            new: true,
            upsert: true,
        });
        return participant;
    }
    catch (error) {
        console.error("Error handling participant joined:", error);
    }
});
exports.onParticipantJoined = onParticipantJoined;
const onParticipantLeft = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield participant_model_1.default.findOneAndUpdate({
        sessionId: data.sessionId,
        participantId: data.participantId,
        roomId: data.meetingId,
    }, {
        $set: { leaveTime: new Date() },
    }, { new: true });
    if (!participant) {
        throw new Error("Người tham gia không tồn tại");
    }
});
exports.onParticipantLeft = onParticipantLeft;
//trong data của webhook có roomId
//RoomId luon ton tai
const getMeetingHistory = (participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const history = yield participant_model_1.default.find({ participantId }).sort({
        leaveTime: -1,
    });
    const roomInfo = yield Promise.all(history.map((data) => __awaiter(void 0, void 0, void 0, function* () {
        const room = yield (0, room_services_1.findRoomOnDatabase)(data.roomId);
        // Import Recording model at top of file if not already imported
        const Record = require("../models/recording.model").default;
        const recordings = yield Record.find({ sessionId: data.sessionId });
        return {
            roomId: (room === null || room === void 0 ? void 0 : room.roomId) || data.roomId,
            sessionId: data.sessionId,
            title: (room === null || room === void 0 ? void 0 : room.title) || "Cuộc họp",
            start: data.joinTime,
            hasRecording: recordings.length > 0,
        };
    })));
    return roomInfo;
});
exports.getMeetingHistory = getMeetingHistory;
const isAlreadyJoined = (roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, session_services_1.findProgressingSession)(roomId);
    const user = yield user_model_1.default.findOne({ email: email });
    if (!user) {
        throw new Error("Người dùng chưa đăng ký");
    }
    const participant = yield participant_model_1.default.findOne({
        participantId: user._id,
        sessionId: session.sessionId,
        roomId: roomId,
    });
    if (!participant || participant.leaveTime === null)
        return false;
    return true;
});
exports.isAlreadyJoined = isAlreadyJoined;
