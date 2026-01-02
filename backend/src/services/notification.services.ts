import Notification from "../models/notification.model";
import Room from "../models/room.model";
import User from "../models/user.model";

const createNotification = async (email, type, message, typeId?: string) => {
  const notification = await Notification.create({
    recipient: email,
    type: typeId ? type + "-" + typeId : type,
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
  console.log(room)
  const message = `${user.displayName} hẹn bạn tham gia lịch họp: "${room.title}"`;
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
export {
  createNotification,
  generateMeetingMessage,
  generateInvitationMessage,
  getNotifications,
  markNotificationAsRead
};
