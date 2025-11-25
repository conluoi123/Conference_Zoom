import { sendOtp, verifyEmail } from "../controllers/signIn.controller";
import { Router, Express } from "express";

const sendOtpRouter = (app: Express) => {
    const sendRouter = Router();
    sendRouter.post("/sendOTP", sendOtp);
    app.use("/auth", sendRouter);
};
const verifyOtpRouter = (app: Express) => {
    const verifyRouter = Router();
    verifyRouter.post("/verifyOTP", verifyEmail);
    app.use("/auth", verifyRouter);
}

export {sendOtpRouter, verifyOtpRouter};