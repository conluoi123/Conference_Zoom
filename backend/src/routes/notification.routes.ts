import { Express, Router } from "express";

const router = Router();

const notificationRoutes = (app: Express) => {
  app.get("/notifications");
  app.use("/", router);
};
