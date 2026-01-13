"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordingRoutes = void 0;
const express_1 = require("express");
const jwt_middleware_1 = require("../middlewares/jwt.middleware");
const recordings_controller_1 = require("../controllers/recordings.controller");
const router = (0, express_1.Router)();
const recordingRoutes = (app) => {
    router.get("/:roomId/:sessionId", jwt_middleware_1.authenticateAccessToken, recordings_controller_1.getSessionRecord);
    app.use("/recordings", router);
};
exports.recordingRoutes = recordingRoutes;
