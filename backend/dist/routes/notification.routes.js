"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
const notificationRoutes = (app) => {
    app.post("/notifications/statusInvitation", notification_controller_1.getStatusToNotify);
    app.get("/notifications", notification_controller_1.getAllNotifications);
    app.post("/notifications/mark-read", notification_controller_1.markAsRead);
    app.use("/", router);
};
exports.default = notificationRoutes;
//# sourceMappingURL=notification.routes.js.map