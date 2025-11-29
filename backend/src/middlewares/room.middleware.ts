import { Request, Response, NextFunction } from "express";
import Room from "../models/room.model";
import { validateRoomOnVideoSDK } from "../services/room.services";
import User from "../models/user.model";

const createRoomMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { peerId, meetingType, startTime } = req.body;

  console.log(peerId, meetingType, startTime);

  const user = await User.findOne({ _id: peerId });

  if (!peerId || !user) {
    return res.status(404).json({ error: "Người dùng không tồn tại!" });
  }

  if (meetingType === "schedule") {
    // 2. Check logic Lên lịch
    if (!startTime) {
      return res
        .status(400)
        .json({ error: "Lên lịch họp thì bắt buộc phải có startTime!" });
    }

    const startDate = new Date(startTime);
    if (isNaN(startDate.getTime())) {
      return res.status(400).json({ error: "startTime không đúng định dạng!" });
    }

    if (startDate < new Date()) {
      return res
        .status(400)
        .json({ error: "Thời gian họp không được ở quá khứ!" });
    }
  }
  // Dữ liệu ngon -> Cho đi tiếp
  next();
};

const joinRoomMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { roomId, peerId } = req.body;
  const user = await User.findOne({ _id: peerId });

  if (!peerId || !user) {
    return res.status(404).json({ error: "Người dùng không tồn tại!" });
  }

  const room = await Room.findOne({ roomId: roomId });
  if (!roomId || !room || !(await validateRoomOnVideoSDK(roomId))) {
    return res.status(400).json({ error: "Phòng không tồn tại!" });
  }

  res.locals.roomInfo = room;
  next();
};

export { createRoomMiddleware, joinRoomMiddleware };
