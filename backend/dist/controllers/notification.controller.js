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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatusToNotify = exports.markAsRead = exports.getAllNotifications = void 0;
const notification_services_1 = require("../services/notification.services");
// notification.controller.ts
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, page, limit } = req.query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const results = yield (0, notification_services_1.getNotifications)(email, pageNum, limitNum);
    return res.status(200).json(results);
});
exports.getAllNotifications = getAllNotifications;
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.body;
    if (!notificationId) {
        return res.status(400).json({ error: "Notification ID is required" });
    }
    try {
        yield (0, notification_services_1.markNotificationAsRead)(notificationId);
        return res.status(200).json({ message: "Notification marked as read" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: "Failed to mark notification as read" });
    }
});
exports.markAsRead = markAsRead;
const getStatusToNotify = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.body;
    if (!notificationId) {
        return res.status(400).json({ error: "Notification ID is required" });
    }
    try {
        const status = yield (0, notification_services_1.getInvitationStatusByNotification)(notificationId);
        return res.status(200).json({ status });
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: "Failed to mark notification as read" });
    }
});
exports.getStatusToNotify = getStatusToNotify;
//# sourceMappingURL=notification.controller.js.map