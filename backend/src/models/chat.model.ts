import mongoose, { Schema, Document } from "mongoose";
export interface IChat extends Document {
  messageId: string;
  sessionId: string;
  senderId: string;
  content: string;
  timestamp: Date;
}
const chatSchema = new Schema<IChat>({
  messageId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  senderId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
  timestamp: { type: Date },
});
const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;