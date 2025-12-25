import mongoose, { Schema, Document } from "mongoose";

//notificationId là objectId do mongoDB sinh ra
export interface INotification extends Document {
  recipientId: string; //email
  type: string; //meeting (đang họp), invitation (mời tham gia lịch họp), schedule(thông báo lịch)
  metaData?: {
    startTime: Date;
  };
  content: string;
  isRead: boolean;
  sentAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipientId: { type: String, required: true },
  type: { type: String },
  metaData: {
    startTime: { type: String, required: true },
  },
  content: { type: String },
  isRead: { type: Boolean },
  sentAt: { type: Date },
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;
