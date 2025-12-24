import { Router, Express } from "express";
import {
  signatureCloudinary,
  saveAvatar,
} from "../controllers/supportProfile.controller";
import { authenticateAccessToken } from "../middlewares/jwt.middleware";
const supportProfileRouter = (app: Express) => {
  const router = Router();
  router.post("/saveAvatar", authenticateAccessToken, saveAvatar);
  router.get("/signature", authenticateAccessToken, signatureCloudinary);
  app.use("", router);
};

export { supportProfileRouter };
