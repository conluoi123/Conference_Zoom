import { ENV } from "../configs/env";
import crypto from "crypto";
import { Request, Response } from "express";
import { saveUrl } from "../services/supportProfile.services";
function signatureCloudinary(req: Request, res: Response) {
  try {
    // doi ra giay timestamp la thoi sang song cua sign (ttl)
    const timestamp = Math.floor(Date.now() / 1000);
    const stringToSign = `folder=avatars&timestamp=${timestamp}${ENV.CLOUDINARY_SECRET_KEY}`;
    const signature = crypto
      .createHash("sha1")
      .update(stringToSign)
      .digest("hex");
    return res.status(200).json({
      signature,
      timestamp,
      apiKey: ENV.CLOUDINARY_API_KEY,
      cloudName: ENV.CLOUDINARY_NAME,
    });
  } catch (error) {
    console.error("Error when get sign ");
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function saveAvatar(req: Request, res: Response) {
  try {
    const { userId, publicId } = req.body;
    if (!publicId) {
      console.log("Miss public Id ");
      return res.status(400);
    }
    const optimizedUrl = `https://res.cloudinary.com/${ENV.CLOUDINARY_NAME}/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/${publicId}`;
    const val = await saveUrl(optimizedUrl, userId);
    if (val === 0) {
      res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ url: optimizedUrl });
  } catch (error) {
    console.error(error);
  }
}

export { saveAvatar, signatureCloudinary };
