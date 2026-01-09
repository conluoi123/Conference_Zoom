"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const room_middleware_1 = require("../middlewares/room.middleware");
const jwt_middleware_1 = require("../middlewares/jwt.middleware");
/*
  Tạo phòng
  Tham gia phòng
  Rời phòng
  Lấy thông tin phòng
*/
const router = (0, express_1.Router)();
const roomRoutes = (app) => {
    router.post("/schedule/invited-users", jwt_middleware_1.authenticateAccessToken, room_controller_1.getInvietedUsersBySchedule);
    // router.get(
    //   "/schedule",
    //   authenticateAccessToken,
    //   getRoomScheduleByInvitedUser
    // );
    router.post("/create", jwt_middleware_1.authenticateAccessToken, room_middleware_1.createRoomMiddleware, room_controller_1.createNewRoom);
    router.post("/:roomId/join", jwt_middleware_1.authenticateAccessToken, room_middleware_1.joinRoomMiddleware, room_controller_1.userJoinRoom);
    // router.get(
    //   "/:roomId/recordings/:sessionId",
    //   authenticateAccessToken,
    //   getSessionRecord
    // );
    app.use("/rooms", router);
};
exports.default = roomRoutes;
//# sourceMappingURL=room.routes.js.map