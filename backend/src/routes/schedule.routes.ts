import { Router, Express } from "express";
import { createSchedule, getListScheduleById, getListScheduleByRoom, updateSchedule } from "../controllers/schedule.controller"
const scheduleRouter = (app: Express) => {
    const router = Router();
    router.post("/getListByRoom", getListScheduleByRoom);
    router.patch("/update", updateSchedule);
    router.get("/getListById", getListScheduleById);
    router.post("/create", createSchedule);
    app.use("/schedule", router);
}

export default scheduleRouter