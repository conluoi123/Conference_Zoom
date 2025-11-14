import { Router, Express } from "express";

const router = Router();
const roomRoutes = (app: Express) => {
  app.post("/rooms" /*createNewRoom*/);
  app.get("/rooms/:roomId" /*getRoomInfo*/);
  app.post("/rooms/:roomId/join" /*userJoinRoom*/);
  app.post("/rooms/:roomId/leave" /*userLeaveRoom*/);
  app.use("/rooms", router);
};

export default roomRoutes;
