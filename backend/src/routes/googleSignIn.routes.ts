import { SignInWithGG } from "../controllers/googleSignIn.controller";
import { Router, Express } from "express";
const router = Router();
router.get("/callback", SignInWithGG);
const signInRouter = (app: Express) => {
    app.use("/auth/google", router);
};

export default signInRouter;