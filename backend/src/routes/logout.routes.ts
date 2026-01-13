import { Router, Express } from "express";
import { logout } from "../controllers/logout.controller";
const logoutRouter = (app: Express) => {
    const router = Router();
    router.post("/logout", logout);
    app.use("/auth", router);
}
export default logoutRouter
