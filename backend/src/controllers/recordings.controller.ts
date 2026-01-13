import { Response } from "express";
import { getRecording } from "../services/recording.services";
import { isHost } from "../services/room.services";
import { RequestWithUser } from "./signIn.controller";

const getSessionRecord = async (req: RequestWithUser, res: Response) => {
  try {
    const sessionId = req.params.sessionId;
    const roomId = req.params.roomId;
    const { id, email } = req.user;
    const records = await getRecording(sessionId);
    const urls = [];
    const userIsHost = await isHost(roomId, id);
    records.forEach((record) => {
      if (userIsHost || record.shared.includes(email)) {
        urls.push(record.fileUrl);
      }
    });
    res.status(200).json(urls);
  } catch (error) {
    res.status(500).json("Internal Server Error");
  }
};

export { getSessionRecord };
