import Room from "../models/room.model";
import { Request, Response } from "express";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
  getRoomShedule,
  getRoomSheduleInvited,
  isInvitedForRoom,
} from "../services/room.services";
import { isInvitedForSession } from "../services/session.services";
import { isDueSchedule, latestSchedule } from "../services/schedule.services";
import Session from "../models/session.model";

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
      if(schedule[schedule.length - 1].hostId != peerId)
      // console.log(schedule)
      if (!isDueSchedule(schedule))
        return res.status(403).json("Chưa đến thời gian vào phòng họp");
    }

    let userType = "peer";
    if (peerId === room.hostId) {
      userType = "host";
    } else 
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
    console.log(error)
    return res.status(500).json(error);
  }
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
    const {roomId, hostId} = req.body;
    if(!roomId || !hostId){
      return res.status(400).json({message: "Missing required fields"});
    }
    const invitedUsers = await getRoomSheduleInvited(roomId, hostId);
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
