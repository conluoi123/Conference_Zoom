import { Router, Express } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import { getUserInfo, updateUserInfo } from "../controllers/user.controller";

const router = Router();
const userRoutes = (app: Express) => {
  app.get("/:id/info", userMiddleware, getUserInfo);
  app.patch("/:id/update", userMiddleware, updateUserInfo);
  app.use("/:id", router);
};

export { userRoutes };
