import { Router, Express } from "express";
import refreshAccessToken from "../services/refreshAccessToken.services";
import { isExistsRefreshToken } from "../services/refreshAccessToken.services";
const refreshTokenRouter = (app: Express) => {
  const router = Router();
  router.post("/refreshToken/check", isExistsRefreshToken);
  router.post("/refreshToken", refreshAccessToken);
  app.use("/auth", router);
};

export { refreshTokenRouter };
