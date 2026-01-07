import Invitation from "../models/invitation.model";
import { ENV } from "../configs/env";

const createInvitation = async (scheduleId, roomId, email, expires) => {
  try {
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
    return invitation._id;
  } catch (error) {
    console.error(error);
  }
};

type InvitationStatus = "accepted" | "declined";

const updateInvitationStatus = async (scheduleId, email, status: string) => {
  const validStatuses: InvitationStatus[] = ["accepted", "declined"];
  if (!validStatuses.includes(status as InvitationStatus)) {
    throw new Error("Trạng thái không hợp lệ");
  }
  const updatedInvitation = await Invitation.findOneAndUpdate(
    {
      scheduleId: scheduleId,
      email: email,
      status: "pending",
    },
    {
      $set: { status: status },
    },
    { new: true }
  );

  if (!updatedInvitation) {
    throw new Error("Lời mời đã hết hạn hoặc không tồn tại");
  }
};

const getScheduleIdByInvitationId = async (invitationId: string) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    throw new Error("Lời mời đã hết hạn hoặc không tồn tại");
  }
  return invitation.scheduleId;
}

const getInvitationStatus = async (invitationId: string) => {
  const invitation = await Invitation.findById(invitationId);
  if (!invitation) {
    return "expired";
  }
  return invitation.status;
}

export {
  createInvitation,
  updateInvitationStatus,
  getScheduleIdByInvitationId,
  getInvitationStatus,
};
