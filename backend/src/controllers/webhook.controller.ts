import { Request, Response } from "express";
import Room from "../models/room.model";
import crypto from "crypto";

const videoSdkWebhook = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) {
      throw new Error(`Không thể xác thực chữ ký`);
    }
    const { webhookType, data } = req.body;
    console.log(`Webhook Event: ${webhookType}`);

    switch (webhookType) {
      // 1. Có người vào phòng
      case "participant-joined": {
        const { roomId, participantId } = data;
        await Room.updateOne(
          { roomId },
          {
            $addToSet: { currentParticipants: participantId }, // Thêm vào danh sách
            $set: { lastUsedAt: new Date() }, // Cập nhật thời gian dùng
          }
        );
        break;
      }

      // 2. Có người rời phòng
      case "participant-left": {
        const { roomId, participantId } = data;
        await Room.updateOne(
          { roomId },
          { $pull: { currentParticipants: participantId } } // Xóa khỏi danh sách
        );
        break;
      }

      // 3. Cuộc họp kết thúc (Hết giờ hoặc mọi người đã ra hết)
      case "session-ended": {
        const { roomId } = data;
        await Room.updateOne(
          { roomId },
          {
            status: "ENDED",
            currentParticipants: [], // Xóa sạch
            activeParticipants: [],
          }
        );
        break;
      }

      // 4. Ghi hình xong (Nếu có dùng Recording)
      case "recording-stopped": {
        const { roomId, fileUrl } = data;
        console.log("Link video:", fileUrl);
        // Lưu link này vào DB để xem lại
        break;
      }
    }

    // BẮT BUỘC: Trả về 200 OK ngay lập tức
    return res.status(200).send("OK");
  } catch (error) {
    console.error("Webhook Error:", error);
    return res.status(500).send("Error");
  }
};

// Hàm kiểm tra chữ ký (Security)
const verifySignature = async (req: Request) => {
  const url = "https://api.videosdk.live/v2/public/rsa-public-key";
  const options = {
    method: "GET",
  };

  const response = await fetch(url, options);
  const data = await response.json();
  const publicKey = data.publicKey;

  const signature = req.headers["videosdk-signature"] as string;
  const body = req.body;

  const isVerified = crypto.verify(
    "RSA-SHA256",
    Buffer.from(JSON.stringify(body)),
    publicKey,
    Buffer.from(signature, "base64")
  );

  if (isVerified) {
    return true;
  }

  return false;
};

export default videoSdkWebhook;
