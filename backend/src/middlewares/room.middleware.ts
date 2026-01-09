import { Request, Response, NextFunction } from "express";
import Room from "../models/room.model";
import {
  findRoomOnDatabase,
  validateRoomOnVideoSDK,
} from "../services/room.services";
import User from "../models/user.model";

const createRoomMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { peerId, meetingType } = req.body;

  const user = await User.findOne({ _id: peerId });

  if (!peerId || !user) {
    return res.status(404).json({ error: "Người dùng không tồn tại!" });
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

  const room = await findRoomOnDatabase(roomId);
  if (!roomId || !room || !(await validateRoomOnVideoSDK(roomId))) {
    return res.status(400).json({ error: "Phòng không tồn tại!" });
  }

  res.locals.roomInfo = room;
  next();
};

export { createRoomMiddleware, joinRoomMiddleware };
