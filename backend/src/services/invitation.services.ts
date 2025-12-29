import { schedule } from "agenda/dist/agenda/schedule";
import Invitation from "../models/invitation.model";
import { ENV } from "../configs/env";

const createInvitation = async (scheduleId, roomId, email, expires) => {
  const invitation = await Invitation.create({
    scheduleId,
    email,
    joinLink: "http://localhost:" + ENV.PORT + "/" + roomId,
    status: "pending",
    sentAt: new Date(),
    expiresAt: expires,
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
    throw new Error("Lời mời đã hết hạn");
  }
  invitation.status = status as "accepted" | "declined";
  await invitation.save();
};

export { createInvitation, updateInvitationStatus };
