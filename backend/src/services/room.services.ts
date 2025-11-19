import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { ENV } from "../configs/env";

const generateToken = (userType?: string, peerId?: string, roomId?: string) => {
  const API_KEY = ENV.VIDEOSDK_API_KEY;
  const SECRET_KEY = ENV.VIDEOSDK_SECRET_KEY;
  const options: jwt.SignOptions = { expiresIn: "2m", algorithm: "HS256" };

  let permissions;
  if (userType === "host") {
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

export { generateToken };
