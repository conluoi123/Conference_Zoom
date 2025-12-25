import { Express, Router } from "express";
import { getAllNotifications } from "../controllers/notification.controller";

const router = Router();

const notificationRoutes = (app: Express) => {
  app.get("/notifications", getAllNotifications);
  app.use("/", router);
};

export default notificationRoutes;
