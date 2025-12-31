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
    /*
      Tạm sửa cái này, sau deploy sẽ sửa lại.
    */
    const isDevelopment = process.env.NODE_ENV === "development" || !req.headers["videosdk-signature"];

    if (!isDevelopment && !(await verifySignature(req))) {
      console.error("❌ Webhook Signature Verification Failed");
      return res.status(401).send("Invalid Signature");
    }

    const { webhookType, data } = req.body;
    console.log(`🔔 Webhook Received: ${webhookType}`);
    if (isDevelopment) console.log("🧪 Running in Dev Mode / Signature Bypassed");

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
        await onParticipantJoined(data);
        break;
      }

      case "participant-left": {
        await onParticipantLeft(data);
        break;
      }

      case "recording-started": {
        await startRecording(data);
        break;
      }

      case "recording-stopped": {
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
