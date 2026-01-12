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
const crypto_1 = __importDefault(require("crypto"));
const session_services_1 = require("../services/session.services");
const participant_services_1 = require("../services/participant.services");
const recording_services_1 = require("../services/recording.services");
const videoSdkWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!verifySignature(req)) {
            throw new Error(`Không thể xác thực chữ ký`);
        }
        const { webhookType, data } = req.body;
        switch (webhookType) {
            case "session-started": {
                const { sessionId, meetingId, start } = data;
                console.log(`Bắt đầu: Room:${meetingId} - ${sessionId}`);
                yield (0, session_services_1.startSession)(meetingId, sessionId, start);
                break;
            }
            case "session-ended": {
                const { sessionId, meetingId, end } = data;
                console.log(`Kết thúc: Room:${meetingId} - ${sessionId}`);
                yield (0, session_services_1.endSession)(meetingId, sessionId, end);
                break;
            }
            case "participant-joined": {
                console.log(`Room:${data.meetingId} - ${data.sessionId} - ${data.participantId} đã tham gia`);
                yield (0, participant_services_1.onParticipantJoined)(data);
                break;
            }
            case "participant-left": {
                console.log(`Room:${data.meetingId} - ${data.sessionId} - ${data.participantId} đã rời phòng`);
                yield (0, participant_services_1.onParticipantLeft)(data);
                break;
            }
            case "recording-started": {
                console.log(`Room:${data.meetingId} - ${data.sessionId} - Bắt đầu ghi hình`);
                yield (0, recording_services_1.startRecording)(data);
                break;
            }
            case "recording-stopped": {
                console.log(`Room:${data.meetingId} - ${data.sessionId} - Kết thúc ghi hình`);
                yield (0, recording_services_1.endRecording)(data);
                break;
            }
        }
        // BẮT BUỘC: Trả về 200 OK ngay lập tức
        return res.status(200).send("OK");
    }
    catch (error) {
        console.error("Webhook Error:", error);
        return res.status(500).send("Error");
    }
});
// Hàm kiểm tra chữ ký (Security)
const verifySignature = (req) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://api.videosdk.live/v2/public/rsa-public-key";
    const options = {
        method: "GET",
    };
    const response = yield fetch(url, options);
    const data = yield response.json();
    const publicKey = data.publicKey;
    const signature = req.headers["videosdk-signature"];
    const body = req.body;
    const isVerified = crypto_1.default.verify("RSA-SHA256", Buffer.from(JSON.stringify(body)), publicKey, Buffer.from(signature, "base64"));
    if (isVerified) {
        return true;
    }
    return false;
});
exports.default = videoSdkWebhook;
