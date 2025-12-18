import Room from "../models/room.model";
import { Request, Response } from "express";
import { createRoomOnVideoSDK, generateToken } from "../services/room.services";
import Session from "../models/session.model";

/*
  Tạo phòng họp:
  - Để tạo phòng, thực hiện gọi API: POST "/rooms/create"
  - Client sẽ gửi data bao gồm "peerId: Id của user" và "userType: user thuộc nhóm nào để tạo token"
  - Server sẽ chịu trách nhiệm gọi API đến VideoSDK để tạo phòng
  - Khi đã có đầy đủ thông tin phòng, lưu lại vào cơ sở dữ liệu và trả về cho client roomId kèm token xác thực để vào roomId đó
 */
const createNewRoom = async (req: Request, res: Response) => {
  try {
    const { peerId, title, meetingType } = req.body;

    const roomId = await createRoomOnVideoSDK();

    await Room.create({
      roomId: roomId, // ID lấy từ VideoSDK
      hostId: peerId, // Người tạo là Host
      title: title || "Cuộc họp mới",
      type: meetingType === "schedule" ? "SCHEDULED" : "INSTANT",
      createdAt: new Date(),
    });

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

/*
  Khi xác thực đầy đủ thông tin từ client
  Tạo token tham gia phòng cho client và gửi lại kèm 1 số thông tin về room cho client hỗ trợ giao diện
  Ngoài ra còn phải cài đặt kết nối socketIO
  Thêm phần activeParticipant[] và invitedPariticipant[]
 */

const userJoinRoom = async (req: Request, res: Response) => {
  const { roomId, peerId } = req.body;
  const roomInfo = res.locals.roomInfo;
  const sessionInfo = await Session.findOne({
    sessionId: roomInfo.sessions.at(-1),
  });

  let userType = "no_waiting"; //set lại waiting

  // if (peerId === roomInfo.hostId) {
  //   userType = "host";
  // } else if (
  //   !roomInfo.askBeforeJoin ||
  //   sessionInfo.invitedUsers.includes(peerId)
  // ) {
  //   userType = "no_waiting";
  // }

  const token = generateToken(userType, peerId, roomId);

  return res.status(200).json(token);
};

//Rời phòng ngắt socket
const userLeaveRoom = (req: Request, res: Response) => {
  const { roomId, peerId, userType } = req.body;
  return 1;
};

export { createNewRoom, userJoinRoom, userLeaveRoom };
