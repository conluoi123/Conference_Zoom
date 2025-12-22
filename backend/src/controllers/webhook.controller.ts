import { Request, Response } from "express";
import crypto from "crypto";
import Session from "../models/session.model";
import { endSession, startSession } from "../services/session.services";
import { onParticipantJoined } from "../services/participant.services";

const videoSdkWebhook = async (req: Request, res: Response) => {
  try {
    if (!verifySignature(req)) {
      throw new Error(`Không thể xác thực chữ ký`);
    }
    const { webhookType, data } = req.body;
    console.log(`Webhook Event: ${webhookType}`);

    switch (webhookType) {
      case "session-started": {
        const { sessionId, meetingId, start } = data;
        await startSession(meetingId, sessionId, start);
        break;
      }

      case "session-ended": {
        const { sessionId, meetingId, end } = data;
        await endSession(meetingId, sessionId, end);
        break;
      }

      case "participant-joined": {
        onParticipantJoined(data);
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
