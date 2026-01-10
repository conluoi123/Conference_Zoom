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
exports.getRoomSheduleInvited = exports.getRoomShedule = exports.isInvitedForRoom = exports.isHost = exports.updateRoomOnDatabase = exports.findRoomOnDatabase = exports.createRoomOnDatabase = exports.validateRoomOnVideoSDK = exports.createRoomOnVideoSDK = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../configs/env");
const room_model_1 = __importDefault(require("../models/room.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
//===================== VIDEOSDK ========================
const generateToken = (userType, peerId, roomId) => {
    const API_KEY = env_1.ENV.VIDEOSDK_API_KEY;
    const SECRET_KEY = env_1.ENV.VIDEOSDK_SECRET_KEY;
    const options = { expiresIn: "60m", algorithm: "HS256" };
    let permissions = ["ask_join"];
    if (userType === "host" || userType === "server") {
        permissions = ["allow_join", "allow_mod"];
    }
    else if (userType === "invitee") {
        permissions = ["allow_join"];
    }
    let payload = {
        apikey: API_KEY,
        permissions: permissions,
    };
    if (roomId || peerId) {
        payload.version = 2;
        payload.roles = ["rtc"];
    }
    if (roomId) {
        payload.roomId = roomId;
    }
    if (peerId) {
        payload.participantId = peerId;
    }
    return jsonwebtoken_1.default.sign(payload, SECRET_KEY, options);
};
exports.generateToken = generateToken;
const createRoomOnVideoSDK = () => __awaiter(void 0, void 0, void 0, function* () {
    // 1. Lấy token
    const managementToken = generateToken("server");
    const region = "sg001";
    const url = `${env_1.ENV.VIDEOSDK_API_ENDPOINT}/rooms`;
    const options = {
        method: "POST",
        headers: {
            Authorization: managementToken,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            region,
            webhook: {
                endPoint: env_1.ENV.BACKEND_URL,
                events: [
                    "participant-joined",
                    "participant-left",
                    "session-started",
                    "session-ended",
                    "recording-started",
                    "recording-stopped",
                    "transcription-started",
                    "transcription-stopped",
                ],
            },
        }),
    };
    // 2. Gọi API
    const response = yield fetch(url, options);
    // 3. Parse dữ liệu JSON
    const data = yield response.json();
    // 4. Trả về kết quả duy nhất 1 lần
    // Kiểm tra xem VideoSDK có trả về lỗi không (ví dụ sai token)
    if (!response.ok) {
        const errorMessage = data.error || "Tạo phòng trên VideoSDK thất bại";
        throw new Error(`Lỗi VideoSDK: ${errorMessage}`);
    }
    return data.roomId;
});
exports.createRoomOnVideoSDK = createRoomOnVideoSDK;
const validateRoomOnVideoSDK = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const managementToken = generateToken("server");
    const url = `${env_1.ENV.VIDEOSDK_API_ENDPOINT}/rooms/validate/${roomId}`;
    const options = {
        method: "GET",
        headers: { Authorization: managementToken },
    };
    const response = yield fetch(url, options);
    const data = yield response.json();
    if (!response.ok) {
        return false;
    }
    return true;
});
exports.validateRoomOnVideoSDK = validateRoomOnVideoSDK;
//===================== ROOM REPOSITORY ========================
const createRoomOnDatabase = (_a) => __awaiter(void 0, [_a], void 0, function* ({ roomId, peerId, title = "Cuộc họp mới", meetingType, }) {
    const room = yield room_model_1.default.create({
        roomId,
        hostId: peerId,
        title,
        type: meetingType === "schedule" ? "SCHEDULED" : "INSTANT",
        createdAt: new Date(),
    });
    if (!room) {
        throw new Error("Tạo phòng thất bại");
    }
});
exports.createRoomOnDatabase = createRoomOnDatabase;
const findRoomOnDatabase = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield room_model_1.default.findOne({ roomId: roomId });
    return room;
});
exports.findRoomOnDatabase = findRoomOnDatabase;
const updateRoomOnDatabase = (roomId, hostId, title, settings, invited) => __awaiter(void 0, void 0, void 0, function* () {
    const update = {};
    const pushData = {};
    if (title != null)
        update.title = title;
    if (settings != null)
        update.settings = settings;
    if (invited && invited.length > 0) {
        pushData.invited = { $each: invited };
    }
    const finalUpdate = {};
    if (Object.keys(update).length > 0)
        finalUpdate.$set = update;
    if (Object.keys(pushData).length > 0)
        finalUpdate.$addToSet = pushData;
    const room = yield room_model_1.default.findOneAndUpdate({ roomId: roomId, hostId: hostId }, finalUpdate, { new: true });
    if (!room) {
        throw new Error("Lỗi database: Cập nhật phòng thất bại");
    }
});
exports.updateRoomOnDatabase = updateRoomOnDatabase;
const isHost = (roomId, participantId) => __awaiter(void 0, void 0, void 0, function* () {
    const room = yield room_model_1.default.findOne({ roomId: roomId, hostId: participantId });
    if (!room)
        return false;
    return true;
});
exports.isHost = isHost;
const isInvitedForRoom = (roomId, peerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, room] = yield Promise.all([
        user_model_1.default.findOne({ _id: peerId }),
        room_model_1.default.findOne({ roomId: roomId }),
    ]);
    if (!user) {
        throw new Error("Phát hiện truy cập bất thường");
    }
    if (!room) {
        throw new Error("Phòng họp không tồn tại");
    }
    if (room.invited.includes(user.email))
        return true;
    return false;
});
exports.isInvitedForRoom = isInvitedForRoom;
const getRoomShedule = (userId, col) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.default.findById(userId);
    const roomSchedule = yield room_model_1.default.find({
        invited: user.email,
    }).select(col);
    return roomSchedule;
});
exports.getRoomShedule = getRoomShedule;
const getRoomSheduleInvited = (roomId, hostId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitedUser = yield room_model_1.default.findOne({
        hostId: hostId,
        roomId: roomId,
    }).select("invited");
    return invitedUser;
});
exports.getRoomSheduleInvited = getRoomSheduleInvited;
