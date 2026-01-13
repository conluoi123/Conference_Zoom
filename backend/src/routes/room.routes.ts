import { Router, Express } from "express";
import {
  createNewRoom,
  // getRoomScheduleByInvitedUser,
  userJoinRoom,
  getInvietedUsersBySchedule,
} from "../controllers/room.controller";
import { getSessionRecord } from "../controllers/recordings.controller";
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
  router.post(
    "/schedule/invited-users",
    authenticateAccessToken,
    getInvietedUsersBySchedule
  );
  // router.get(
  //   "/schedule",
  //   authenticateAccessToken,
  //   getRoomScheduleByInvitedUser
  // );
  router.post(
    "/create",
    authenticateAccessToken,
    createRoomMiddleware,
    createNewRoom
  );
  router.post(
    "/:roomId/join",
    authenticateAccessToken,
    joinRoomMiddleware,
    userJoinRoom
  );
  // router.get(
  //   "/:roomId/recordings/:sessionId",
  //   authenticateAccessToken,
  //   getSessionRecord
  // );
  app.use("/rooms", router);
};

export default roomRoutes;
