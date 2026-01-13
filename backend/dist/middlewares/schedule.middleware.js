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
exports.isValidToReschedule = exports.isValidTimeToSchedule = void 0;
const schedule_services_1 = require("../services/schedule.services");
const schedule_model_1 = __importDefault(require("../models/schedule.model"));
const isValidTimeToSchedule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, startTime } = req.body;
        const start = new Date(startTime);
        // startTime phải lớn hơn thời điểm hiện tại ít nhất 15 phút 30s
        if (start.getTime() - Date.now() < 15 * 60 * 1000 + 30 * 1000) {
            return res
                .status(403)
                .json({
                message: "Thời gian bắt đầu không hợp lệ. Phải sau ít nhất 15 phút 30 giây so với thời điểm hiện tại.",
            });
        }
        const flag = yield (0, schedule_services_1.getScheduleToHandleCreate)(roomId, start);
        if (!flag) {
            return res
                .status(403)
                .json({ message: "Thời gian bắt đầu không hợp lệ. Đã có cuộc họp khác được lên lịch cho phòng này trước cuộc họp này không quá 15 phút 30 giây." });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res
            .status(403)
            .json({ message: "Start time is not valid to schedule" });
    }
});
exports.isValidTimeToSchedule = isValidTimeToSchedule;
const isValidToReschedule = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { scheduleId, startTime } = req.body;
        if (!startTime || !scheduleId) {
            next();
            return;
        }
        const schedule = yield schedule_model_1.default.findById(scheduleId);
        if (!schedule) {
            return res.status(404).json({ message: "Schedule is not exists" });
        }
        if (schedule.endTime) {
            return res.status(403).json({ message: "Schedule meeting is end" });
        }
        // startTime mới và startTime hiện tại trong schedule phải cách thời điểm hiện tại ít nhất 15 phút 30s
        const now = Date.now();
        const newStart = new Date(startTime).getTime();
        const oldStart = new Date(schedule.startTime).getTime();
        if (oldStart - now < 15 * 60 * 1000 + 30 * 1000) {
            return res.status(403).json({ message: "Cannot reschedule soon" });
        }
        if (newStart - now < 15 * 60 * 1000 + 30 * 1000) {
            return res
                .status(403)
                .json({ message: "Thời gian bắt đầu không hợp lệ. Phải sau ít nhất 15 phút 30 giây so với thời điểm hiện tại.1" });
        }
        next();
    }
    catch (error) {
        console.log(error);
        return res
            .status(403)
            .json({ message: "Start time is not valid to schedule" });
    }
});
exports.isValidToReschedule = isValidToReschedule;
