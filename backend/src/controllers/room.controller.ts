import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
  isInvitedForRoom,
} from "../services/room.services";

const createNewRoom = async (req: Request, res: Response) => {
  try {
    const { peerId, title, meetingType } = req.body;

    const roomId = await createRoomOnVideoSDK();

    await createRoomOnDatabase({ roomId, peerId, title, meetingType });

    const token = generateToken("host", peerId, roomId);

    return res.status(200).json({ roomId, hostId: peerId, token });
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
  if (await isInvitedForRoom(roomId, peerId)) {
    userType = "invitee";
  }
  //con invitee cho session nua
  console.log(userType);

  const token = generateToken(userType, peerId, roomId);

  return res
    .status(200)
    .json({ hostId: room.hostId, settings: room.settings, token: token });
};

export { createNewRoom, userJoinRoom };
