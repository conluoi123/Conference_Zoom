import Notification from "../models/notification.model";
import Room from "../models/room.model";
import User from "../models/user.model";
import { getInvitationStatus } from "./invitation.services";

const createNotification = async (email, type, message: string) => {
  const notification = await Notification.create({
    recipient: email,
    type: type,
    content: message,
    isRead: false,
    sentAt: new Date(),
  });
  if (!notification) {
    throw new Error("Lỗi tạo thông báo");
  }
  return notification;
};

const generateMeetingMessage = async (roomId, participantId: string) => {
  const [user, room] = await Promise.all([
    User.findOne({ _id: participantId }),
    Room.findOne({ roomId: roomId }),
  ]);

  if (!user || !room) {
    return "Bạn được mời tham gia phòng họp";
  }

  const message = `${user.displayName} đã mời bạn tham gia phòng họp:${room.roomId}`;
  return message;
};

const generateInvitationMessage = async (roomId, participantId: string) => {
  const [user, room] = await Promise.all([
    User.findOne({ _id: participantId }),
    Room.findOne({ roomId: roomId }),
  ]);

  if (!user || !room) {
    return "Bạn được mời tham gia lịch họp";
  }

  const message = `${user.displayName} hẹn bạn tham gia lịch họp:${room.roomId}`;
  return message;
};

const getNotifications = async (
  email: string,
  page: number = 1,
  limit: number = 10
) => {
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: email })
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit),
    Notification.countDocuments({ recipient: email }),
    Notification.countDocuments({ recipient: email, isRead: false }),
  ]);

  return {
    notifications: notifications || [],
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

const markNotificationAsRead = async (notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true },
    { new: true }
  );
  if (!notification) {
    throw new Error("Notification not found");
  }
  return notification;
};

const getInvitationStatusByNotification = async (notificationId: string) => {
  const notification = await Notification.findById(notificationId);
  if (!notification) {
    throw new Error("Notification not found");
  }
  const status = await getInvitationStatus(notification.type.split("-")[1]);
  return status;
};
export {
  createNotification,
  generateMeetingMessage,
  generateInvitationMessage,
  getNotifications,
  markNotificationAsRead,
  getInvitationStatusByNotification,
};
