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
exports.endSession = exports.startSession = exports.isInvitedForSession = exports.addInvitee = exports.findProgressingSession = void 0;
const session_model_1 = __importDefault(require("../models/session.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const startSession = (roomId, sessionId, start) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_model_1.default.create({
        roomId: roomId,
        sessionId: sessionId,
        start: new Date(start),
        end: null,
        invited: [],
    });
    if (!session) {
        throw new Error("Lỗi database: Tạo phiên thất bại");
    }
});
exports.startSession = startSession;
const endSession = (roomId, sessionId, end) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_model_1.default.updateOne({
        roomId: roomId,
        sessionId: sessionId,
    }, {
        end: new Date(end),
    });
    if (!session) {
        throw new Error("Lỗi database: Phiên không tồn tại");
    }
});
exports.endSession = endSession;
const findProgressingSession = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield session_model_1.default.findOne({ roomId: roomId, end: null });
    if (!session) {
        throw new Error("Phiên họp đã kết thúc");
    }
    return session;
});
exports.findProgressingSession = findProgressingSession;
const addInvitee = (roomId, email) => __awaiter(void 0, void 0, void 0, function* () {
    yield session_model_1.default.updateOne({ roomId: roomId }, { $addToSet: { invited: email } });
});
exports.addInvitee = addInvitee;
const isInvitedForSession = (roomId, peerId) => __awaiter(void 0, void 0, void 0, function* () {
    const [user, session] = yield Promise.all([
        user_model_1.default.findOne({ _id: peerId }),
        session_model_1.default.findOne({ roomId: roomId, end: null }),
    ]);
    if (!user) {
        throw new Error("Phát hiện truy cập bất thường");
    }
    if (!session) {
        return false;
    }
    if (session.invited.includes(user.email))
        return true;
    return false;
});
exports.isInvitedForSession = isInvitedForSession;
