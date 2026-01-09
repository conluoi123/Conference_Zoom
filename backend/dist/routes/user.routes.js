"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const user_middleware_1 = require("../middlewares/user.middleware");
const user_controller_1 = require("../controllers/user.controller");
const jwt_middleware_1 = require("../middlewares/jwt.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
const userRoutes = (app) => {
    app.get("/:id/info", jwt_middleware_1.authenticateAccessToken, user_middleware_1.userMiddleware, user_controller_1.getUserInfo);
    app.patch("/:id/update", jwt_middleware_1.authenticateAccessToken, user_middleware_1.userMiddleware, user_controller_1.updateUserInfo);
    app.post("/:id/meeting-history", jwt_middleware_1.authenticateAccessToken, user_middleware_1.userMiddleware, user_controller_1.getUserMeetingHistory);
    app.get("/:id/notifications", jwt_middleware_1.authenticateAccessToken, user_middleware_1.userMiddleware, notification_controller_1.getAllNotifications);
    app.post("/notifications/mark-read", jwt_middleware_1.authenticateAccessToken, notification_controller_1.markAsRead);
    router.get("/auth/me", jwt_middleware_1.authenticateAccessToken, user_controller_1.getUser);
    app.use("", router);
};
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.routes.js.map