import { Request, Response } from "express";
import crypto from "crypto";
import { endSession, startSession } from "../services/session.services";
import {
  onParticipantJoined,
  onParticipantLeft,
} from "../services/participant.services";
import { endRecording, startRecording } from "../services/recording.services";

const videoSdkWebhook = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) {
      throw new Error(`Không thể xác thực chữ ký`);
    }
    const { webhookType, data } = req.body;

    switch (webhookType) {
      case "session-started": {
        const { sessionId, meetingId, start } = data;
        console.log(`Bắt đầu: Room:${meetingId} - ${sessionId}`);
        await startSession(meetingId, sessionId, start);
        break;
      }

      case "session-ended": {
        const { sessionId, meetingId, end } = data;
        console.log(`Kết thúc: Room:${meetingId} - ${sessionId}`);
        await endSession(meetingId, sessionId, end);
        break;
      }

      case "participant-joined": {
        console.log(
          `Room:${data.meetingId} - ${data.sessionId} - ${data.participantId} đã tham gia`
        );
        await onParticipantJoined(data);
        break;
      }

      case "participant-left": {
        console.log(
          `Room:${data.meetingId} - ${data.sessionId} - ${data.participantId} đã rời phòng`
        );
        await onParticipantLeft(data);
        break;
      }

      case "recording-started": {
        console.log(
          `Room:${data.meetingId} - ${data.sessionId} - Bắt đầu ghi hình`
        );
        await startRecording(data);
        break;
      }

      case "recording-stopped": {
        console.log(
          `Room:${data.meetingId} - ${data.sessionId} - Kết thúc ghi hình`
        );
        await endRecording(data);
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
