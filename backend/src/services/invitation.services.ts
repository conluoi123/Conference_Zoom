import { schedule } from "agenda/dist/agenda/schedule";
import Invitation from "../models/invitation.model";
import { ENV } from "../configs/env";

const createInvitation = async (scheduleId, roomId, email) => {
  const invitation = await Invitation.create({
    scheduleId,
    email,
    joinLink: "http://localhost:" + ENV.PORT,
    status: "pending",
    sentAt: new Date(),
  });
  if (!invitation) {
    throw new Error("Không thể tạo lời mời");
  }
};
const updateInvitationStatus = async (scheduleId, email, status: string) => {
  const invitation = await Invitation.findOne({
    scheduleId: scheduleId,
    email: email,
    status: "pending",
  });
  if (!invitation) {
    throw new Error("Không tìm thấy lời mời hợp lệ");
  }
  invitation.status = status as "pending" | "accepted" | "declined";
  await invitation.save();
};

export { createInvitation, updateInvitationStatus };
