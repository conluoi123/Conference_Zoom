import Room from "../models/room.model";
import { Request, Response } from "express";
import { ENV } from "../configs/env";
import { createRoomOnVideoSDK, generateToken } from "../services/room.services";

/*
  Tạo phòng họp:
  - Để tạo phòng, thực hiện gọi API: POST "/rooms"
  - Client sẽ gửi data bao gồm "peerId: Id của user" và "userType: user thuộc nhóm nào để tạo token"
  - Server sẽ chịu trách nhiệm gọi API đến VideoSDK để tạo phòng
  - Khi đã có đầy đủ thông tin phòng, lưu lại vào cơ sở dữ liệu và trả về cho client roomId kèm token xác thực để vào roomId đó
 */
const createNewRoom = async (req: Request, res: Response) => {
  try {
    const { peerId, userType, title, meetingType, startTime } = req.body;
    const roomId = await createRoomOnVideoSDK();
    await Room.create({
      roomId: roomId, // ID lấy từ VideoSDK
      hostId: peerId, // Người tạo là Host
      title: title || "Cuộc họp mới",
      type: meetingType === "schedule" ? "SCHEDULED" : "INSTANT",
      startTime: meetingType === "schedule" ? new Date(startTime) : undefined,
      status: "ACTIVE", // Mặc định vừa tạo là đang hoạt động
      createdAt: new Date(),
    });

    const token = generateToken(userType, peerId, roomId);

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

/*
  Khi xác thực đầy đủ thông tin từ client
  Tạo token tham gia phòng cho client và gửi lại kèm 1 số thông tin về room cho client hỗ trợ giao diện
  Ngoài ra còn phải cài đặt kết nối socketIO
  Thêm phần activeParticipant[] và invitedPariticipant[]
 */
const userJoinRoom = (req: Request, res: Response) => {
  const { roomId, peerId, userType } = req.body;
  const token = generateToken(userType, peerId, roomId);

  const roomInfo = res.locals.roomInfo;
  return res.status(200).json(token);
};

const userLeaveRoom = (req: Request, res: Response) => {
  const { roomId, peerId, userType } = req.body;
  return 1;
};

export { createNewRoom, userJoinRoom, userLeaveRoom };
