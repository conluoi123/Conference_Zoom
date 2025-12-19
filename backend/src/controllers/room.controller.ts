import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
} from "../services/room.services";

const createNewRoom = async (req: Request, res: Response) => {
  try {
    const { peerId, title, meetingType } = req.body;

    const roomId = await createRoomOnVideoSDK();

    await createRoomOnDatabase({ roomId, peerId, title, meetingType });

    const token = generateToken("host", peerId, roomId);

    return res.status(200).json({ roomId, token });
  } catch (error: any) {
    console.error("Tạo phòng:", error.message);

    if (error.message.includes("Lỗi VideoSDK")) {
      return res.status(502).json({ error: error.message });
    }

    // Lỗi server/DB nói chung
    return res.status(500).json({ error: "Tạo phòng thất bại!" });
  }
};

const userJoinRoom = async (req: Request, res: Response) => {
  const { roomId, peerId } = req.body;
  const room = res.locals.roomInfo;

  let userType = "peer";
  if (peerId === room.hostId) userType = "host";

  const token = generateToken(userType, peerId, roomId);

  return res.status(200).json({ settings: room.settings, token: token });
};

export { createNewRoom, userJoinRoom };
