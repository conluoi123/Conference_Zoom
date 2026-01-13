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
exports.getInvitationStatus = exports.getScheduleIdByInvitationId = exports.updateInvitationStatus = exports.createInvitation = void 0;
const invitation_model_1 = __importDefault(require("../models/invitation.model"));
const env_1 = require("../configs/env");
const createInvitation = (scheduleId, roomId, email, expires) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invitation = yield invitation_model_1.default.create({
            scheduleId,
            email,
            joinLink: `${env_1.ENV.FRONTEND_URL}` + "/" + roomId,
            status: "pending",
            sentAt: new Date(),
            expiresAt: expires,
        });
        if (!invitation) {
            throw new Error("Không thể tạo lời mời");
        }
        return invitation._id;
    }
    catch (error) {
        console.error(error);
    }
});
exports.createInvitation = createInvitation;
const updateInvitationStatus = (scheduleId, email, status) => __awaiter(void 0, void 0, void 0, function* () {
    const validStatuses = ["accepted", "declined"];
    if (!validStatuses.includes(status)) {
        throw new Error("Trạng thái không hợp lệ");
    }
    const updatedInvitation = yield invitation_model_1.default.findOneAndUpdate({
        scheduleId: scheduleId,
        email: email,
        status: "pending",
    }, {
        $set: { status: status },
    }, { new: true });
    if (!updatedInvitation) {
        throw new Error("Lời mời đã hết hạn hoặc không tồn tại");
    }
});
exports.updateInvitationStatus = updateInvitationStatus;
const getScheduleIdByInvitationId = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitation = yield invitation_model_1.default.findById(invitationId);
    if (!invitation) {
        throw new Error("Lời mời đã hết hạn hoặc không tồn tại");
    }
    return invitation.scheduleId;
});
exports.getScheduleIdByInvitationId = getScheduleIdByInvitationId;
const getInvitationStatus = (invitationId) => __awaiter(void 0, void 0, void 0, function* () {
    const invitation = yield invitation_model_1.default.findById(invitationId);
    if (!invitation) {
        return "expired";
    }
    return invitation.status;
});
exports.getInvitationStatus = getInvitationStatus;
