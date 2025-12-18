import mongoose, { Schema, Document } from "mongoose";

//messageId là objectId do mongoDB sinh ra

export interface IChat extends Document {
  sessionId: string;
  participantId: string;
  content: string;
  timestamp: Date;
}
const chatSchema = new Schema<IChat>({
  sessionId: {
    type: String,
    required: true,
  },
  participantId: {
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
