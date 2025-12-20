import { Router, Express } from "express";
import { createNewRoom, userJoinRoom } from "../controllers/room.controller";
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
