import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
  getRoomShedule,
  getRoomSheduleInvited
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

  let userType = "host";
  if (peerId === room.hostId) userType = "host";

  const token = generateToken(userType, peerId, roomId);

  return res.status(200).json({ settings: room.settings, token: token });
};

const getRoomScheduleByInvitedUser = async (req: Request, res: Response) => { 
  try {
    const { userId } = req.query;
    if(!userId){
      return res.status(400).json({message: "userId is not found"});
    }
    const roomIds = await getRoomShedule(userId as string, "roomId");
    const hostIds = await getRoomShedule(userId as string, "hostId");
    const startTimes = await getRoomShedule(userId as string, "startTime");
    return res.status(200).json({ roomIds, hostIds, startTimes });
  } catch (error) {
    console.error("getRoomScheduleByInvitedUser error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

const getInvietedUsersBySchedule = async (req: Request, res: Response) => { 
  try {
    const {roomId, hostId, startTime} = req.body;
    if(!roomId || !hostId || !startTime){
      return res.status(400).json({message: "Missing required fields"});
    }
    const invitedUsers = await getRoomSheduleInvited(roomId, hostId, startTime);
    return res.status(200).json({ invitedUsers });
  } catch (error) {
    console.error("getInvietedUsersBySchedule error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export {
  createNewRoom,
  userJoinRoom,
  getRoomScheduleByInvitedUser,
  getInvietedUsersBySchedule,
};
