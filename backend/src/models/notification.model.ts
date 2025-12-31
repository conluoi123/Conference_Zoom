import mongoose, { Schema, Document } from "mongoose";

//notificationId là objectId do mongoDB sinh ra
export interface INotification extends Document {
  recipient: string; //email
  type: string; //meeting (đang họp), invitation (mời tham gia lịch họp), schedule(thông báo lịch)
  roomId?: string;
  content: string;
  isRead: boolean;
  sentAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: { type: String, required: true },
  type: { type: String },
  roomId : {type: String},
  content: { type: String },
  isRead: { type: Boolean },
  sentAt: {
    type: Date,
    default: Date.now,
    expires: 604800,
  },
});

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
export default Notification;
