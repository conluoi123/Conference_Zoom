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
exports.getSchedule = exports.getScheduleToHandleCreate = exports.getScheduleInfo = exports.isDueSchedule = exports.latestSchedule = void 0;
exports.createScheduleOnDb = createScheduleOnDb;
exports.updateScheduleOnDb = updateScheduleOnDb;
const schedule_model_1 = __importDefault(require("../models/schedule.model"));
function createScheduleOnDb(hostId, roomId, title, startTime, endTime, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const schedule = yield schedule_model_1.default.create({
                hostId,
                roomId,
                title,
                startTime,
                endTime,
                duration,
            });
            yield schedule.save();
            return schedule;
        }
        catch (error) {
            console.error(error);
            return null;
        }
    });
}
function updateScheduleOnDb(scheduleId, title, startTime, endTime, duration) {
    return __awaiter(this, void 0, void 0, function* () {
        const schedule = yield schedule_model_1.default.findById(scheduleId);
        if (!schedule) {
            return null;
        }
        const updatedSchedule = yield schedule_model_1.default.findByIdAndUpdate(schedule._id, { title, startTime, endTime, duration }, { new: true });
        return updatedSchedule;
    });
}
//Vì 1 phòng họp sẽ có thể có nhiều lịch hẹn nhưng chỉ có thể có 1 hẹn sắp hoặc đang diễn ra (chưa kết thúc)
const latestSchedule = (roomId) => {
    const schedule = schedule_model_1.default.find({ roomId: roomId, endTime: null });
    if (!schedule) {
        throw new Error("Lỗi database: Không tìm thấy lịch hẹn");
    }
    return schedule;
};
exports.latestSchedule = latestSchedule;
const isDueSchedule = (schedule) => {
    const now = Date.now();
    const due = new Date(schedule[schedule.length - 1].startTime).getTime();
    if (due < now) {
        return true;
    }
    return false;
};
exports.isDueSchedule = isDueSchedule;
const getScheduleInfo = (scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield schedule_model_1.default.findById(scheduleId);
    if (!schedule) {
        throw new Error("Lịch hẹn đã bị hủy");
    }
    return schedule;
});
exports.getScheduleInfo = getScheduleInfo;
const getScheduleToHandleCreate = (roomId, start) => __awaiter(void 0, void 0, void 0, function* () {
    // neu co cuoc hen co startTime lon hon startTime hien tai hay startTime  thi khong the tao
    const offsetMs = (15 * 60 + 30) * 1000; // 15p 30s
    const startPlus = new Date(start.getTime() + offsetMs);
    const schedule = yield schedule_model_1.default.findOne({
        roomId,
        startTime: { $gte: startPlus },
        endTime: null,
    });
    if (schedule)
        return false;
    return true;
});
exports.getScheduleToHandleCreate = getScheduleToHandleCreate;
const getSchedule = (scheduleId) => __awaiter(void 0, void 0, void 0, function* () {
    const schedule = yield schedule_model_1.default.findById(scheduleId);
    return schedule;
});
exports.getSchedule = getSchedule;
