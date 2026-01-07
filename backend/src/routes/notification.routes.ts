import { Express, Router } from "express";
import { getAllNotifications, getStatusToNotify, markAsRead } from "../controllers/notification.controller";

const router = Router();

const notificationRoutes = (app: Express) => {
  app.post("/notifications/statusInvitation", getStatusToNotify);
  app.get("/notifications", getAllNotifications);
  app.post("/notifications/mark-read", markAsRead);
  app.use("/", router);
};

export default notificationRoutes;
