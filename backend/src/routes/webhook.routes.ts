import { Router, Express } from "express";
import webhook from "../controllers/webhook.controller";

const router = Router();

const webHook = (app: Express) => {
  app.post("/", webhook);
  app.use("/", router);
};

export default webHook;
