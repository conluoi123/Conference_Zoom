import mongoose, { Schema, Document } from "mongoose";
export interface INotification extends Document {
  notificationId: string;
  recipientId: string;
  type: string;
  content: string;
  isRead: boolean;
  sentAt: Date;
}
const notificationSchema = new Schema<INotification>({
  notificationId: { type: String, required: true, unique: true },
  recipientId: { type: String, required: true },
  type: { type: String },
  content: { type: String },
  isRead: { type: Boolean },
  sentAt: { type: Date },
});
const Notification = mongoose.model<INotification>("Notification", notificationSchema);
export default Notification;