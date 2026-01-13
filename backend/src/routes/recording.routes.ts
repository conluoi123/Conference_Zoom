import { Router, Express } from "express";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";
import { getSessionRecord } from "../controllers/recordings.controller";

const router = Router();

const recordingRoutes = (app: Express) => {
  router.get("/:roomId/:sessionId", authenticateAccessToken, getSessionRecord);
  app.use("/recordings", router);
};

export { recordingRoutes };
