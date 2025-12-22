import { session } from "express-session";
import Session from "../models/session.model";

const findProgressingSession = async (roomId: string) => {
  const session = await Session.findOne({ roomId: roomId });
  if (!session) {
    throw new Error("Không tìm thấy phiên đang diễn ra");
  }
  return session;
};

const addInvitee = async (roomId, email: string) => {
  const session = await findProgressingSession(roomId);
  session.invited.push(email);
  await session.save();
};

export { findProgressingSession, addInvitee };
