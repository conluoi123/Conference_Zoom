import { Router, Express } from "express";
import {
  createSchedule,
  getListSchedule,
  getListScheduleByHostId,
  getUpcomingSchedules,
  updateSchedule,
} from "../controllers/schedule.controller";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";
const scheduleRouter = (app: Express) => {
  const router = Router();
  router.patch("/updated", authenticateAccessToken, updateSchedule);
  router.get("/listSchedule", authenticateAccessToken, getListSchedule);
  router.get("/upcoming", authenticateAccessToken, getUpcomingSchedules);
  // router.patch("/update", authenticateAccessToken, updateSchedule);
  

  router.get(
    "/getListByHostId",
    authenticateAccessToken,
    getListScheduleByHostId
  );
  router.post("/create", authenticateAccessToken, createSchedule);
  app.use("/schedule", router);
};

export default scheduleRouter;
