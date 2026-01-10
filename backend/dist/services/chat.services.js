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
exports.getChat = exports.insertNewMessage = void 0;
const chat_model_1 = __importDefault(require("../models/chat.model"));
const session_services_1 = require("./session.services");
const createChat = (sessionId) => __awaiter(void 0, void 0, void 0, function* () {
    const chat = yield chat_model_1.default.create({
        sessionId: sessionId,
        chat: [],
    });
    if (!chat) {
        throw new Error("Lỗi database: Không thể tạo đoạn chat");
    }
    return chat;
});
const insertNewMessage = (roomId, newMessage) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, session_services_1.findProgressingSession)(roomId);
    let chatObj = yield chat_model_1.default.findOne({ sessionId: session.sessionId });
    if (!chatObj) {
        chatObj = yield createChat(session.sessionId);
    }
    chatObj.chat.push(newMessage);
    yield chatObj.save();
});
exports.insertNewMessage = insertNewMessage;
const getChat = (roomId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield (0, session_services_1.findProgressingSession)(roomId);
    const chat = yield chat_model_1.default.findOne({ sessionId: session.sessionId });
    if (!chat) {
        return [];
    }
    return chat.chat;
});
exports.getChat = getChat;
