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
exports.shareRecording = exports.getRecording = exports.endRecording = exports.startRecording = void 0;
const recording_model_1 = __importDefault(require("../models/recording.model"));
const startRecording = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield recording_model_1.default.create({
        sessionId: data.sessionId,
        createdAt: new Date(),
        shared: [],
    });
    if (!record) {
        throw new Error("Không thể tạo bản ghi");
    }
});
exports.startRecording = startRecording;
const endRecording = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield recording_model_1.default.findOneAndUpdate({ sessionId: data.sessionId }, {
        $set: { fileUrl: data.fileUrl },
    }, { new: true });
    if (!record) {
        throw new Error("Không tìm thấy bản ghi");
    }
});
exports.endRecording = endRecording;
const shareRecording = (sessionId, emails) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield recording_model_1.default.findOneAndUpdate({ sessionId: sessionId }, {
        $addToSet: {
            shared: { $each: emails },
        },
    }, { new: true });
    return record;
});
exports.shareRecording = shareRecording;
/**Từ lịch sử các cuộc họp tham gia có nút view recordings, bấm vào nếu có thì hiện kh thì thôi */
const getRecording = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield recording_model_1.default.find({ sessionId });
    if (!records) {
        throw new Error("Không có bản ghi được chia sẻ cho phiên họp này");
    }
    return records;
});
exports.getRecording = getRecording;
//# sourceMappingURL=recording.services.js.map