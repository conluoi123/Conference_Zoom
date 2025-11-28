import { sendOtp, verifyEmail } from "../controllers/signIn.controller";
import { Router, Express } from "express";
import { passport } from "../controllers/signIn.controller";
import { outlookLogInCallback } from "../services/signIn.services";
import { ENV } from "../configs/env";
import session from "express-session";
import { SignInWithGG, DirectGoogle } from "../controllers/signIn.controller";
import { setCsrfToken, sendCsrfToken, csrfProtection } from "../middlewares/signIn.middleware";

const sendOtpRouter = (app: Express) => {
  const sendRouter = Router();
  sendRouter.get("/reqCsrfCode", setCsrfToken, sendCsrfToken);
  sendRouter.post("/sendOTP",csrfProtection, sendOtp);
  app.use("/auth", sendRouter);
};
const verifyOtpRouter = (app: Express) => {
  const verifyRouter = Router();
  verifyRouter.post("/verifyOTP", verifyEmail);
  app.use("/auth", verifyRouter);
};

//OUTLOOK
const outlookSignInRouter = (app: Express) => {
  app.use(passport.initialize());
  app.use(passport.session());
  app.get(
    "/auth/outlook",
    passport.authenticate("microsoft", {
      scope: ["user.read", "openid", "profile", "email"],
      prompt: "select_account",
      session: true,
    })
  );
  app.get(
    "/auth/outlook/callback",
    passport.authenticate("microsoft", {
      failureRedirect: "/login",
      failureMessage: true,
      session: true,
    }),
    outlookLogInCallback
  );
};

//Google
const signInRouter = (app: Express) => {
  const directRouter = Router();
  directRouter.get("/google", DirectGoogle);
  app.use("/auth", directRouter);
  const callbackRouter = Router();
  callbackRouter.get("/google/callback", SignInWithGG);
  app.use("/auth", callbackRouter);
};
export { sendOtpRouter, verifyOtpRouter, outlookSignInRouter, signInRouter };
