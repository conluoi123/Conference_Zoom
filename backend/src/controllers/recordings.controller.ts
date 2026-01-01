import { Response } from "express";
import { getRecording } from "../services/recording.services";
import { isHost } from "../services/room.services";
import { RequestWithUser } from "./signIn.controller";

const getSessionRecord = async (req: RequestWithUser, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const roomId = req.params.roomId;
    const { id, email } = req.user;
    const record = await getRecording(sessionId);
    if (!isHost(roomId, id) || !record.shared.includes(email)) {
      res.status(200).json("");
    }
    res.status(200).json(record.fileUrl);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export { getSessionRecord };
