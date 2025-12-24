import { Router, Express } from "express";
import {
  createNewRoom,
  getRoomScheduleByInvitedUser,
  userJoinRoom,
  getInvietedUsersBySchedule,
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
    "/rooms/schedule/invited-users",
    authenticateAccessToken,
    getInvietedUsersBySchedule
  );
  app.get("/rooms/schedule", authenticateAccessToken, getRoomScheduleByInvitedUser);
  app.post(
    "/rooms/create",
    authenticateAccessToken,
    createRoomMiddleware,
    createNewRoom
  ); // create new meeting room
  app.post(
    "/rooms/:roomId/join",
    authenticateAccessToken,
    joinRoomMiddleware,
    userJoinRoom
  );
  app.use("/rooms", router);
};

export default roomRoutes;
