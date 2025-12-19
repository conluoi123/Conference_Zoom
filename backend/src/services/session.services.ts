import Session from "../models/session.model";

const findProgressingSession = async (roomId: string) => {
  const session = await Session.findOne({ roomId: roomId });
  if (!session) {
    throw new Error("Không tìm thấy phiên đang diễn ra");
  }
  return session;
};

export { findProgressingSession };
