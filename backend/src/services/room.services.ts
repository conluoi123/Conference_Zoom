import jwt from "jsonwebtoken";
import { ENV } from "../configs/env";
import Room from "../models/room.model";
import User from "../models/user.model";

//===================== VIDEOSDK ========================
const generateToken = (userType?: string, peerId?: string, roomId?: string) => {
  const API_KEY = ENV.VIDEOSDK_API_KEY;
  const SECRET_KEY = ENV.VIDEOSDK_SECRET_KEY;
  const options: jwt.SignOptions = { expiresIn: "60m", algorithm: "HS256" };

  let permissions = ["ask_join"];
  if (userType === "host" || userType === "server") {
    permissions = ["allow_join", "allow_mod"];
  } else if (userType === "invitee") {
    permissions = ["allow_join"];
  }

  let payload: any = {
    apikey: API_KEY,
    permissions: permissions,
  };

  if (roomId || peerId) {
    payload.version = 2;
    payload.roles = ["rtc"];
  }

  if (roomId) {
    payload.roomId = roomId;
  }
  if (peerId) {
    payload.participantId = peerId;
  }

  return jwt.sign(payload, SECRET_KEY, options);
};

const createRoomOnVideoSDK = async () => {
  // 1. Lấy token
  const managementToken = generateToken("server");

  const region = "sg001";
  const url = `${ENV.VIDEOSDK_API_ENDPOINT}/rooms`;
  const options = {
    method: "POST",
    headers: {
      Authorization: managementToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      region,
      webhook: {
        endPoint: "https://eudaemonistically-metallographical-kasha.ngrok-free.dev",
        events: [
          "participant-joined",
          "participant-left",
          "session-started",
          "session-ended",
          "recording-started",
          "recording-stopped",
          "transcription-started",
          "transcription-stopped",
        ],
      },
    }),
  };

  // 2. Gọi API
  const response = await fetch(url, options);

  // 3. Parse dữ liệu JSON
  const data = await response.json();

  // 4. Trả về kết quả duy nhất 1 lần
  // Kiểm tra xem VideoSDK có trả về lỗi không (ví dụ sai token)
  if (!response.ok) {
    const errorMessage = data.error || "Tạo phòng trên VideoSDK thất bại";
    throw new Error(`Lỗi VideoSDK: ${errorMessage}`);
  }

  return data.roomId;
};

const validateRoomOnVideoSDK = async (roomId: string) => {
  const managementToken = generateToken("server");
  const url = `${ENV.VIDEOSDK_API_ENDPOINT}/rooms/validate/${roomId}`;
  const options = {
    method: "GET",
    headers: { Authorization: managementToken },
  };
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) {
    return false;
  }
  return true;
};

//===================== ROOM REPOSITORY ========================
const createRoomOnDatabase = async ({
  roomId,
  peerId,
  title = "Cuộc họp mới",
  meetingType,
}: {
  roomId: string;
  peerId: string;
  title?: string;
  meetingType: "schedule" | "instant";
}) => {
  const room = await Room.create({
    roomId,
    hostId: peerId,
    title,
    type: meetingType === "schedule" ? "SCHEDULED" : "INSTANT",
    createdAt: new Date(),
  });

  if (!room) {
    throw new Error("Tạo phòng thất bại");
  }
};

const findRoomOnDatabase = async (roomId) => {
  const room = await Room.findOne({ roomId: roomId });
  return room;
};

const updateRoomOnDatabase = async (
  roomId: string,
  hostId: string,
  title: string,
  settings: {
    allowJoin: boolean;
    allowShareScreen: boolean;
    allowChat: boolean;
    allowMic: boolean;
    allowCam: boolean;
  },
  invited: string[]
) => {
  const update: any = {};
  if (title != null) update.title = title;
  if (settings != null) update.settings = settings;
  if (invited != null) update.invited = [...update.invited, ...invited];
  const room = await Room.findOneAndUpdate(
    { roomId: roomId, hostId: hostId },
    { $set: update },
    { new: true }
  );
  if (!room) {
    throw new Error("Lỗi database: Cập nhật phòng thất bại");
  }
};

const isHost = async (roomId, participantId: string) => {
  const room = await Room.findOne({ roomId: roomId, hostId: participantId });
  if (!room) return false;
  return true;
};

const isInvitedForRoom = async (roomId, peerId: string) => {
  const [user, room] = await Promise.all([
    User.findOne({ _id: peerId }),
    Room.findOne({ roomId: roomId }),
  ]);
  if (!user) {
    throw new Error("Phát hiện truy cập bất thường");
  }
  if (!room) {
    throw new Error("Phòng họp không tồn tại");
  }

  if (room.invited.includes(user.email)) return true;

  return false;
};

const getRoomShedule = async (userId: string, col: string) => {
  const roomSchedule = await Room.find({
    hostId: { $ne: userId },
    type: "SCHEDULED",
    invited: { $in: userId },
  }).select(col);
  return roomSchedule;
};

const getRoomSheduleInvited = async (roomId: string, hostId: string) => {
  const invitedUser = await Room.find({
    hostId: hostId,
    roomId: roomId,
  }).select("invited");
  return invitedUser;
};

export {
  generateToken,
  createRoomOnVideoSDK,
  validateRoomOnVideoSDK,
  createRoomOnDatabase,
  findRoomOnDatabase,
  updateRoomOnDatabase,
  isHost,
  isInvitedForRoom,
  getRoomShedule,
  getRoomSheduleInvited,
};
