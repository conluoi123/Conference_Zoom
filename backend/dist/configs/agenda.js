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
exports.startAgenda = void 0;
const agenda_1 = __importDefault(require("agenda"));
const env_1 = require("./env");
const notification_1 = require("../socket/events/notification");
// 1. Khởi tạo và kết nối DB ngay lập tức
const agenda = new agenda_1.default({
    db: {
        address: env_1.ENV.DB_URL,
        collection: "notifications",
    },
    processEvery: "1 minute",
});
(0, notification_1.scheduleNotification)(agenda);
const startAgenda = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield agenda.start();
        console.log("🚀 Agenda Scheduler đã bắt đầu chạy!");
    }
    catch (error) {
        console.error("Lỗi khởi động Agenda:", error);
    }
});
exports.startAgenda = startAgenda;
exports.default = agenda;
//# sourceMappingURL=agenda.js.map