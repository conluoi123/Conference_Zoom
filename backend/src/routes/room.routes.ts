import { Router, Express } from "express";
import {
  createNewRoom,
  userJoinRoom,
  userLeaveRoom,
} from "../controllers/room.controller";
import {
  createRoomMiddleware,
  joinRoomMiddleware,
} from "../middlewares/room.middleware";

const router = Router();
const roomRoutes = (app: Express) => {
  app.post("/rooms", createRoomMiddleware, createNewRoom); // create new meeting room
  //app.get("/rooms/:roomId" getRoomInfo); //get participant info
  app.post("/rooms/:roomId/join", joinRoomMiddleware, userJoinRoom);
  app.post("/rooms/:roomId/leave", userLeaveRoom);
  app.use("/rooms", router);
};

export default roomRoutes;
