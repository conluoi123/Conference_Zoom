import { Request, Response, NextFunction } from "express";
import { getScheduleToHandleCreate } from "../services/schedule.services";
import { getInvitationStatus } from "../services/invitation.services";
import Schedule from "../models/schedule.model";
const isValidTimeToSchedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { roomId, startTime } = req.body;
    const start = new Date(startTime);
    // startTime phải lớn hơn thời điểm hiện tại ít nhất 15 phút 30s
    if (start.getTime() - Date.now() < 15 * 60 * 1000 + 30 * 1000) {
      return res
        .status(403)
        .json({
          message:
            "Thời gian bắt đầu không hợp lệ. Phải sau ít nhất 15 phút 30 giây so với thời điểm hiện tại.",
        });
    }
    
    const flag = await getScheduleToHandleCreate(roomId, start);
    if (!flag) {
      return res
        .status(403)
        .json({ message: "Thời gian bắt đầu không hợp lệ. Đã có cuộc họp khác được lên lịch cho phòng này trước cuộc họp này không quá 15 phút 30 giây." });
    }
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ message: "Start time is not valid to schedule" });
  }
};

const isValidToReschedule = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { scheduleId, startTime } = req.body;
    if (!startTime || !scheduleId) {
      next();
      return;
    }
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule is not exists" });
    }
    if (schedule.endTime) {
      return res.status(403).json({ message: "Schedule meeting is end" });
    }
    // startTime mới và startTime hiện tại trong schedule phải cách thời điểm hiện tại ít nhất 15 phút 30s
    const now = Date.now();
    const newStart = new Date(startTime).getTime();
    const oldStart = new Date(schedule.startTime).getTime();
    if (oldStart - now < 15 * 60 * 1000 + 30 * 1000) {
      return res.status(403).json({ message: "Cannot reschedule soon" });
    }
    if (newStart - now < 15 * 60 * 1000 + 30 * 1000) {
      return res
        .status(403)
        .json({ message: "Thời gian bắt đầu không hợp lệ. Phải sau ít nhất 15 phút 30 giây so với thời điểm hiện tại.1" });
    }
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ message: "Start time is not valid to schedule" });
  }
};

export { isValidTimeToSchedule, isValidToReschedule };
