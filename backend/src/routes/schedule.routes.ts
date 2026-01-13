import { Router, Express } from "express";
import {
  createSchedule,
  getListSchedule,
  getListScheduleByHostId,
  getScheduleById,
  getUpcomingSchedules,
  updateSchedule,
} from "../controllers/schedule.controller";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";
import {
  isValidTimeToSchedule,
  isValidToReschedule,
} from "../middlewares/schedule.middleware";
const scheduleRouter = (app: Express) => {
  const router = Router();
  router.get("/getScheduleById/:scheduleId", authenticateAccessToken, getScheduleById);
  router.patch("/updated", authenticateAccessToken,isValidToReschedule, updateSchedule);
  router.get("/listSchedule", authenticateAccessToken, getListSchedule);
  router.get("/upcoming", authenticateAccessToken, getUpcomingSchedules);
  router.get(
    "/getListByHostId",
    authenticateAccessToken,
    getListScheduleByHostId
  );
  router.post(
    "/create",
    authenticateAccessToken,
    isValidTimeToSchedule,
    createSchedule
  );
  app.use("/schedule", router);
};

export default scheduleRouter;
