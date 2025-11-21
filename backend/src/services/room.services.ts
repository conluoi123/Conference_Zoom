import jwt from "jsonwebtoken";
import { ENV } from "../configs/env";

const generateToken = (userType?: string, peerId?: string, roomId?: string) => {
  const API_KEY = ENV.VIDEOSDK_API_KEY;
  const SECRET_KEY = ENV.VIDEOSDK_SECRET_KEY;
  const options: jwt.SignOptions = { expiresIn: "2m", algorithm: "HS256" };

  let permissions;
  if (userType === "host" || userType === "server") {
    permissions = ["allow_join", "allow_mod"];
  } else if (userType === "invited") {
    permissions = ["allow_join"];
  } else {
    permissions = ["ask_join"];
  }

  let payload: any = {
    apikey: API_KEY,
    permissions: permissions,
  };

  if (roomId && peerId) {
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
    body: JSON.stringify({ region }),
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
export { generateToken, createRoomOnVideoSDK, validateRoomOnVideoSDK };
