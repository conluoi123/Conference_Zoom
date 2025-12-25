import { Request, Response } from "express";
import {
  createScheduleOnDb,
  updateScheduleOnDb,
} from "../services/schedule.services";
import Schedule from "../models/schedule.model";

async function createSchedule(req: Request, res: Response) {
  try {
    const { hostId, roomId, title, startTime, endTime, duration } = req.body;
    if (!hostId || !roomId || !title || !startTime || !endTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const iseExistSchedule = await Schedule.findOne({
      hostId,
      roomId,
      startTime,
    });
    if (iseExistSchedule) {
      return res.status(409).json({ message: "Schedule is exist" });
    }
    const schedule = await createScheduleOnDb(
      hostId,
      roomId,
      title,
      startTime,
      endTime,
      duration
    );
    if (!schedule) {
      return res.status(500).json({ message: "Failed to create schedule" });
    }
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
