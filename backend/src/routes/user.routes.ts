import { Router, Express } from "express";
import { userMiddleware } from "../middlewares/user.middleware";
import {
  getUser,
  getUserInfo,
  getUserMeetingHistory,
  updateUserInfo,
} from "../controllers/user.controller";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";
import { getAllNotifications, markAsRead } from "../controllers/notification.controller";

const router = Router();
const userRoutes = (app: Express) => {
  app.get("/:id/info", authenticateAccessToken, userMiddleware, getUserInfo);
  app.patch(
    "/:id/update",
    authenticateAccessToken,
    userMiddleware,
    updateUserInfo
  );
  app.post(
    "/:id/meeting-history",
    authenticateAccessToken,
    userMiddleware,
    getUserMeetingHistory
  );
  app.get(
    "/:id/notifications",
    authenticateAccessToken,
    userMiddleware,
    getAllNotifications
  );
  app.post(
    "/notifications/mark-read",
    authenticateAccessToken,
    markAsRead
  );
  router.get("/auth/me", authenticateAccessToken, getUser);
  app.use("", router);
};

export { userRoutes };
