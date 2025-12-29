import { Router, Express } from "express";
import {
  createNewRoom,
  getRoomScheduleByInvitedUser,
  userJoinRoom,
  getInvietedUsersBySchedule,
  getSessionRecord,
} from "../controllers/room.controller";
import {
  createRoomMiddleware,
  joinRoomMiddleware,
} from "../middlewares/room.middleware";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";

/*
  Tạo phòng
  Tham gia phòng
  Rời phòng
  Lấy thông tin phòng
*/

const router = Router();
const roomRoutes = (app: Express) => {
  app.post(
    "/schedule/invited-users",
    authenticateAccessToken,
    getInvietedUsersBySchedule
  );
  app.get("/schedule", authenticateAccessToken, getRoomScheduleByInvitedUser);
  app.post(
    "/create",
    authenticateAccessToken,
    createRoomMiddleware,
    createNewRoom
  );
  app.post(
    "/:roomId/join",
    authenticateAccessToken,
    joinRoomMiddleware,
    userJoinRoom
  );
  app.get(
    "/:roomId/recordings/:sessionId",
    authenticateAccessToken,
    getSessionRecord
  );
  app.use("/rooms", router);
};

export default roomRoutes;
