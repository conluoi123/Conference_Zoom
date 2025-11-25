import express from "express";
import webhook from "../controllers/webhook.controller";

const router = express.Router();

router.post("/events", webhook);

export default router;
