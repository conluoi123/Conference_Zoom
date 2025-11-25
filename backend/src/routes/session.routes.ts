import { Router, Express } from "express";
import { getActiveParticipants } from "../controllers/session.controller";

const router = Router();

const sessionRoute = (app: Express) => {
  app.get("/:roomId/:sessionId/active-participants", getActiveParticipants); //Xem số người active
};
