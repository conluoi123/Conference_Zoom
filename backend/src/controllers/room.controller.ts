import Room from "../models/room.model";
import { Request, Response } from "express";
import { ENV } from "../configs/env";
import { generateToken } from "../services/room.services";
import { start } from "repl";

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
    if (!userType || !peerId) {
      return res.status(400).json({ error: "Missing essential information" });
    }
    // 1. Lấy token
    const managementToken = generateToken(userType);

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
      console.error("VideoSDK Error:", data);
      return res.status(response.status).json(data);
    }

    const newRoom = await Room.create({
      roomId: data.roomId, // ID lấy từ VideoSDK
      hostId: peerId, // Người tạo là Host
      title: title || "Cuộc họp mới",
      type: meetingType === "schedule" ? "SCHEDULED" : "INSTANT",
      startTime: meetingType === "schedule" ? new Date(startTime) : undefined,
      status: "ACTIVE", // Mặc định vừa tạo là đang hoạt động
      createdAt: new Date(),
    });

    const token = generateToken(userType, peerId, data.roomId);

    return res.json({ roomId: data.roomId, token });
  } catch (error) {
    // 5. Bắt lỗi mạng hoặc lỗi server
    console.error("Network/Server error:", error);
    res.status(500).json({ error: "Failed to create room" });
  }
};

export { createNewRoom };
