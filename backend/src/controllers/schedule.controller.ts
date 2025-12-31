import { Request, Response } from "express";
import {
  createScheduleOnDb,
  updateScheduleOnDb,
} from "../services/schedule.services";
import Schedule from "../models/schedule.model";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  generateToken,
} from "../services/room.services";
import {
  createNotification,
  generateInvitationMessage,
} from "../services/notification.services";
import { getIO } from "../socket/socketHandler";
import { createInvitation } from "../services/invitation.services";
import { addInvitee } from "../services/session.services";

async function createSchedule(req: Request, res: Response) {
  try {
    const { hostId, title, startTime, duration, emails } = req.body;
    if (!hostId || !title || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //Tạo phòng mới
    const roomId = await createRoomOnVideoSDK();
    await createRoomOnDatabase({
      roomId,
      peerId: hostId,
      title,
      meetingType: "schedule",
    });
    //Tạo lịch mới
    const schedule = await createScheduleOnDb(
      hostId,
      roomId,
      title,
      startTime,
      null,
      duration
    );

    if (!schedule) {
      return res.status(500).json({ message: "Failed to create schedule" });
    }

    //Tạo thông báo
    const message = await generateInvitationMessage(roomId, hostId);
    emails.forEach((email) => {
      createInvitation(schedule._id, roomId, email); //Tạo lời mời
      createNotification(email, "meeting", message); //Tạo thông báo

      //Bắn thông báo
      const io = getIO();
      io.to(email).emit("notification:invitation", message);
    });

    return res.status(200).json({ schedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getListScheduleById(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        message: "userId is not found",
      });
    }
    const listSchedule = await Schedule.find({ hostId: userId });
    return res.status(200).json({
      listSchedule,
    });
  } catch (error) {
    console.error("getListSchedule error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function updateSchedule(req: Request, res: Response) {
  try {
    const { roomId, hostId, title, startTime, endTime, duration } = req.body;
    if (!roomId || !hostId || !title || !startTime || !endTime || !duration) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    const updatedSchedule = await updateScheduleOnDb(
      roomId,
      hostId,
      title,
      startTime,
      endTime,
      duration
    );
    if (!updatedSchedule) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }
    return res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

async function getListScheduleByRoom(req: Request, res: Response) {
  try {
    const { roomIds, hostIds, startTimes } = req.body;
    if (!roomIds || !hostIds || !startTimes) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }
    const listSchedule = await Schedule.find({
      roomId: { $in: roomIds },
      hostId: { $in: hostIds },
      startTime: { $in: startTimes },
    });
    if (!listSchedule || listSchedule.length === 0) {
      return res.status(404).json({
        message: "No schedules found",
      });
    }
    return res.status(200).json({
      listSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export {
  createSchedule,
  getListScheduleById,
  updateSchedule,
  getListScheduleByRoom,
};
