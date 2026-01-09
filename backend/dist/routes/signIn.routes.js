"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signInRouter = exports.outlookSignInRouter = exports.verifyOtpRouter = exports.sendOtpRouter = void 0;
const signIn_controller_1 = require("../controllers/signIn.controller");
const express_1 = require("express");
const signIn_controller_2 = require("../controllers/signIn.controller");
const signIn_services_1 = require("../services/signIn.services");
const signIn_controller_3 = require("../controllers/signIn.controller");
const sendOtpRouter = (app) => {
    const sendRouter = (0, express_1.Router)();
    sendRouter.post("/sendOTP", signIn_controller_1.sendOtp);
    app.use("/auth", sendRouter);
};
exports.sendOtpRouter = sendOtpRouter;
const verifyOtpRouter = (app) => {
    const verifyRouter = (0, express_1.Router)();
    verifyRouter.post("/verifyOTP", signIn_controller_1.verifyEmail);
    app.use("/auth", verifyRouter);
};
exports.verifyOtpRouter = verifyOtpRouter;
//OUTLOOK
const outlookSignInRouter = (app) => {
    app.use(signIn_controller_2.passport.initialize());
    app.use(signIn_controller_2.passport.session());
    app.get("/auth/outlook", signIn_controller_2.passport.authenticate("microsoft", {
        scope: ["user.read", "openid", "profile", "email"],
        prompt: "select_account",
        session: true,
    }));
    app.get("/auth/outlook/callback", signIn_controller_2.passport.authenticate("microsoft", {
        failureRedirect: "/login",
        failureMessage: true,
        session: true,
    }), signIn_services_1.outlookLogInCallback);
};
exports.outlookSignInRouter = outlookSignInRouter;
//Google
const signInRouter = (app) => {
    const directRouter = (0, express_1.Router)();
    directRouter.get("/google", signIn_controller_3.DirectGoogle);
    app.use("/auth", directRouter);
    const callbackRouter = (0, express_1.Router)();
    callbackRouter.get("/google/callback", signIn_controller_3.SignInWithGG);
    app.use("/auth", callbackRouter);
};
exports.signInRouter = signInRouter;
//# sourceMappingURL=signIn.routes.js.map