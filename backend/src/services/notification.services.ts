import Notification from "../models/notification.model";
import Room from "../models/room.model";
import Schedule from "../models/schedule.model";
import User from "../models/user.model";

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
};

const generateMeetingMessage = async (roomId, participantId: string) => {
  const [user, room] = await Promise.all([
    User.findOne({ _id: participantId }),
    Room.findOne({ roomId: roomId }),
  ]);

  const message = `${user.displayName} đã mời bạn tham gia phòng họp: "${room.title}"`;
  return message;
};

const generateInvitationMessage = async (roomId, participantId: string) => {
  const [user, room] = await Promise.all([
    User.findOne({ _id: participantId }),
    Room.findOne({ roomId: roomId }),
  ]);

  const message = `${user.displayName} hẹn bạn tham gia lịch họp: "${room.title}"`;
  return message;
};

const getNotifications = async (email: string) => {
  const notifications = await Notification.find({ recipient: email });
  if (!notifications) {
    return [];
  }
  return notifications;
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
export {
  createNotification,
  generateMeetingMessage,
  generateInvitationMessage,
  getNotifications,
  markNotificationAsRead
};
