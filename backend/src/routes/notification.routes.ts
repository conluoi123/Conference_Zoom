import { Express, Router } from "express";
import { getAllNotifications, markAsRead } from "../controllers/notification.controller";

const router = Router();

const notificationRoutes = (app: Express) => {
  app.get("/notifications", getAllNotifications);
  app.post("/notifications/mark-read", markAsRead);
  app.use("/", router);
};

export default notificationRoutes;
