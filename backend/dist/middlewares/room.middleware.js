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
exports.joinRoomMiddleware = exports.createRoomMiddleware = void 0;
const room_services_1 = require("../services/room.services");
const user_model_1 = __importDefault(require("../models/user.model"));
const createRoomMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { peerId, meetingType } = req.body;
    const user = yield user_model_1.default.findOne({ _id: peerId });
    if (!peerId || !user) {
        return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }
    // Dữ liệu ngon -> Cho đi tiếp
    next();
});
exports.createRoomMiddleware = createRoomMiddleware;
const joinRoomMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { roomId, peerId } = req.body;
    const user = yield user_model_1.default.findOne({ _id: peerId });
    if (!peerId || !user) {
        return res.status(404).json({ error: "Người dùng không tồn tại!" });
    }
    const room = yield (0, room_services_1.findRoomOnDatabase)(roomId);
    if (!roomId || !room || !(yield (0, room_services_1.validateRoomOnVideoSDK)(roomId))) {
        return res.status(400).json({ error: "Phòng không tồn tại!" });
    }
    res.locals.roomInfo = room;
    next();
});
exports.joinRoomMiddleware = joinRoomMiddleware;
//# sourceMappingURL=room.middleware.js.map