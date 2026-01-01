import { session } from "express-session";
import Session from "../models/session.model";
import User from "../models/user.model";

const startSession = async (roomId, sessionId, start: string) => {
  const session = await Session.create({
    roomId: roomId,
    sessionId: sessionId,
    start: new Date(start),
    end: null,
    invited: [],
  });
  if (!session) {
    throw new Error("Lỗi database: Tạo phiên thất bại");
  }
};

const endSession = async (roomId, sessionId, end: string) => {
  const session = await Session.updateOne(
    {
      roomId: roomId,
      sessionId: sessionId,
    },
    {
      end: new Date(end),
    }
  );
  if (!session) {
    throw new Error("Lỗi database: Phiên không tồn tại");
  }
};

const findProgressingSession = async (roomId: string) => {
  const session = await Session.findOne({ roomId: roomId, end: null });
  if (!session) {
    throw new Error("Phiên họp đã kết thúc");
  }
  return session;
};

const addInvitee = async (roomId, email: string) => {
  const session = await findProgressingSession(roomId);
  session.invited.push(email);
  await session.save();
};

const isInvitedForSession = async (roomId, peerId: string) => {
  const [user, session] = await Promise.all([
    User.findOne({ _id: peerId }),
    Session.findOne({ roomId: roomId, end: null }),
  ]);
  if (!user) {
    throw new Error("Phát hiện truy cập bất thường");
  }
  console.log(session);
  if (!session) {
    // throw new Error("Phiên họp đã kết thúc");
    return false;
  }
  if ( session.invited.includes(user.email)) return true;
  return false;
};

export {
  findProgressingSession,
  addInvitee,
  isInvitedForSession,
  startSession,
  endSession,
};
