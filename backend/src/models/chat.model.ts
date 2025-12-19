import mongoose, { Schema, Document } from "mongoose";

export interface IChat extends Document {
  sessionId: string;
  chat: [
    {
      participantId: string;
      participantName: String;
      content: string;
      timestamp: Date;
    }
  ];
}
const chatSchema = new Schema<IChat>({
  sessionId: {
    type: String,
    required: true,
  },
  chat: [
    {
      participantId: {
        type: String,
        required: true,
      },
      participantName: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      timestamp: { type: Date, required: true },
    },
  ],
});
const Chat = mongoose.model<IChat>("Chat", chatSchema);
export default Chat;
