// test API: localhost:5500/auth/outlook
import { passport } from "../controllers/outlookSignIn.controller";
import { Router, Express } from "express";
import { outlookLogInCallback } from "../services/outlookSignIn.services";
const outlookSignInRouter = (app: Express) => {
  app.get(
    "/auth/outlook",
    passport.authenticate("microsoft", {
      session: false,
      scope: ["user.read", "openid", "profile", "email"],
      prompt: 'select_account',
    })
  );
  app.get(
    "/auth/outlook/callback",
    passport.authenticate("microsoft", {
      failureRedirect: "/login",
      failureMessage: true,
      session: false,
    }),outlookLogInCallback);
};

export default outlookSignInRouter;
