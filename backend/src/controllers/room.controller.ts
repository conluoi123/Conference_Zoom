import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
  isInvitedForRoom,
} from "../services/room.services";
import { isInvitedForSession } from "../services/session.services";
import { isDueSchedule, latestSchedule } from "../services/schedule.services";

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
  try {
    const { roomId, peerId } = req.body;
    const room = res.locals.roomInfo;

    if (room.type === "SCHEDULED") {
      const schedule = await latestSchedule(roomId);
      if (!isDueSchedule(schedule))
        return res.status(403).json("Chưa đến thời gian vào phòng họp");
    }

    let userType = "peer";
    if (peerId === room.hostId) userType = "host";
    if (
      (await isInvitedForRoom(roomId, peerId)) ||
      (await isInvitedForSession(roomId, peerId))
    ) {
      userType = "invitee";
    }

    const token = generateToken(userType, peerId, roomId);

    return res
      .status(200)
      .json({ hostId: room.hostId, settings: room.settings, token: token });
  } catch (error) {
    return res.status(500).json(error);
  }
};

export { createNewRoom, userJoinRoom };
