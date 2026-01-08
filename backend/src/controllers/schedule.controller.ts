import { Request, Response } from "express";
import {
  createScheduleOnDb,
  updateScheduleOnDb,
  getSchedule
} from "../services/schedule.services";
import Schedule from "../models/schedule.model";
import {
  createRoomOnDatabase,
  createRoomOnVideoSDK,
  findRoomOnDatabase,
  generateToken,
  getRoomShedule,
  getRoomSheduleInvited,
  updateRoomOnDatabase,
} from "../services/room.services";
import {
  createNotification,
  generateInvitationMessage,
} from "../services/notification.services";
import { getIO } from "../socket/socketHandler";
import { createInvitation } from "../services/invitation.services";

async function createSchedule(req: Request, res: Response) {
  try {
    const { hostId, roomId, title, startTime, duration, emails } = req.body;
    if (!hostId || !title || !startTime || !duration) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    let room = "";
    if (roomId === "") {
      room = await createRoomOnVideoSDK();
      console.log(`room id: ${room}`);
      await createRoomOnDatabase({
        roomId: room,
        peerId: hostId,
        title,
        meetingType: "schedule",
      });
    } else {
      const isExistRoom = await findRoomOnDatabase(roomId);
      if (!isExistRoom) {
        return res.status(404).json({ message: "Room is not exists" });
      }
      room = roomId;
      await updateRoomOnDatabase(room, hostId, title, null, null);
    }
    //Tạo phòng mới

    //Tạo lịch mới
    const schedule = await createScheduleOnDb(
      hostId,
      room,
      title,
      startTime,
      null,
      duration
    );
    console.log(schedule._id);

    if (!schedule) {
      return res.status(500).json({ message: "Failed to create schedule" });
    }

    /**Về lịch hẹn
     * Bên muốn tạo lịch phải trước thời gian họp là 30p
     * Lời mời chỉ có hạn đến trước lịch họp là 15p
     */

    //Tạo thông báo
    const expires = new Date(startTime);
    expires.setMinutes(expires.getMinutes() - 15); // Lùi lại 15 phút

    const message = await generateInvitationMessage(room, hostId);
    emails.forEach(async (email) => {
      const id = await createInvitation(schedule._id, room, email, expires); //Tạo lời mời
      const notification = await createNotification(
        email,
        `invitation-${id}`,
        message
      ); //Tạo thông báo
      const { type, content, isRead, sentAt } = notification;
      //Bắn thông báo
      const io = getIO();
      io.to(email).emit("notification:invitation", {
        type,
        content,
        isRead,
        sentAt,
      });
    });

    return res.status(200).json({ schedule });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getListScheduleByHostId(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        message: "userId is not found",
      });
    }
    const listSchedule = await Schedule.find({
      hostId: userId,
      startTime: {$gte: new Date()},
      $or: [{ endTime: null }, { endTime: { $gt: new Date() } }],
    });
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
    console.log(0);
    const { scheduleId, title, startTime, endTime, duration, emails } =
      req.body;

    const updatedSchedule = await updateScheduleOnDb(
      scheduleId,
      title,
      startTime,
      endTime,
      duration
    );
    console.log(1);
    if (!updatedSchedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }

    const expires = new Date(startTime);
    expires.setMinutes(expires.getMinutes() - 15);

    const existsInvitedUser = await getRoomSheduleInvited(
      updatedSchedule.roomId,
      updatedSchedule.hostId
    );

    const invitedList = existsInvitedUser?.invited ?? [];
    const message = await generateInvitationMessage(
      updatedSchedule.roomId,
      updatedSchedule.hostId
    );

    for (const email of emails) {
      if (!invitedList.includes(email)) {
        const id = await createInvitation(
          scheduleId,
          updatedSchedule.roomId,
          email,
          expires
        );
        const notification = await createNotification(
          email,
          `invitation-${id}`,
          message
        );
        const { type, content, isRead, sentAt } = notification;

        const io = getIO();
        io.to(email).emit("notification:invitation", {
          type,
          content,
          isRead,
          sentAt,
        });
      }
    }

    return res.status(200).json({
      message: "Schedule updated successfully",
      schedule: updatedSchedule,
    });
  } catch (error) {
    console.error("Update schedule error:", error);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
const getUpcomingSchedules = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const start = new Date();

    const now = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      0,
      0,
      0,
      0
    );
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // rooms user được mời
    const invitedRooms = await getRoomShedule(userId as string, "roomId");

    const invitedRoomIds = invitedRooms.map((r) => String(r.roomId));

    // schedules user được mời
    const invitedSchedules = await Schedule.find({
      roomId: { $in: invitedRoomIds },
      startTime: { $gte: now, $lte: threeDaysLater },
      $or: [{ endTime: null }, { endTime: { $gt: now } }],
    });

    // schedules user là host
    const hostSchedules = await Schedule.find({
      hostId: userId,
      startTime: { $gte: now, $lte: threeDaysLater },
      $or: [{ endTime: null }, { endTime: { $gt: now } }],
    });

    const unique = new Map();
    [...invitedSchedules, ...hostSchedules].forEach((s) =>
      unique.set(String(s._id), s)
    );

    const schedules = [...unique.values()].sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error("getUpcomingSchedules error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
const getListSchedule = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const today = new Date();

    // ---- mốc thời gian ----
    const oneMonthAgo = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 30
    );

    const oneMonthLater = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 30
    );

    // rooms user được mời
    const invitedRooms = await getRoomShedule(userId as string, "roomId");
    const invitedRoomIds = invitedRooms.map((r) => String(r.roomId));

    // schedules user được mời
    const invitedSchedules = await Schedule.find({
      roomId: { $in: invitedRoomIds },
      startTime: { $gte: oneMonthAgo, $lte: oneMonthLater },
      $or: [{ endTime: null }, { endTime: { $gt: oneMonthAgo } }],
    });

    // schedules user là host
    const hostSchedules = await Schedule.find({
      hostId: userId,
      startTime: { $gte: oneMonthAgo, $lte: oneMonthLater },
      $or: [{ endTime: null }, { endTime: { $gt: oneMonthAgo } }],
    });

    // ---- loại trùng ----
    const unique = new Map();
    [...invitedSchedules, ...hostSchedules].forEach((s) =>
      unique.set(String(s._id), s)
    );

    const schedules = [...unique.values()].sort(
      (a: any, b: any) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return res.status(200).json({
      success: true,
      schedules,
    });
  } catch (error) {
    console.error("getUpcomingSchedules error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getScheduleById = async (req: Request, res: Response) => {
  try {
    const schedule = await getSchedule(req.params.scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: "Schedule not found" });
    }
    return res.status(200).json({ schedule });
  } catch (error) {
    console.error("Get Schedule error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export {
  createSchedule,
  getListScheduleByHostId,
  updateSchedule,
  getUpcomingSchedules,
  getListSchedule,
  getScheduleById,
};
