"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const schedule_controller_1 = require("../controllers/schedule.controller");
const jwt_middleware_1 = require("../middlewares/jwt.middleware");
const schedule_middleware_1 = require("../middlewares/schedule.middleware");
const scheduleRouter = (app) => {
    const router = (0, express_1.Router)();
    router.get("/getScheduleById/:scheduleId", jwt_middleware_1.authenticateAccessToken, schedule_controller_1.getScheduleById);
    router.patch("/updated", jwt_middleware_1.authenticateAccessToken, schedule_middleware_1.isValidToReschedule, schedule_controller_1.updateSchedule);
    router.get("/listSchedule", jwt_middleware_1.authenticateAccessToken, schedule_controller_1.getListSchedule);
    router.get("/upcoming", jwt_middleware_1.authenticateAccessToken, schedule_controller_1.getUpcomingSchedules);
    router.get("/getListByHostId", jwt_middleware_1.authenticateAccessToken, schedule_controller_1.getListScheduleByHostId);
    router.post("/create", jwt_middleware_1.authenticateAccessToken, schedule_middleware_1.isValidTimeToSchedule, schedule_controller_1.createSchedule);
    app.use("/schedule", router);
};
exports.default = scheduleRouter;
