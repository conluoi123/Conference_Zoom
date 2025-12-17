import mongoose, { Schema, Document } from "mongoose";

// 1. Interface (Copy từ thiết kế của bạn)
export interface ISession extends Document {
  roomId: string;
  sessionId: string;
  scheduleId: String;
  start: Date;
  end: Date;
  sessionInvitedUsers: string[];
  status: "waiting" | "active" | "ended";
}

// 2. Schema (Triển khai cho Mongoose)
const sessionSchema = new Schema<ISession>({
  roomId: {
    type: String,
    required: true,
    index: true,
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  scheduleId: {
    type: String,
  },

  start: { type: Date },
  end: { type: Date },

  sessionInvitedUsers: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["waiting" , "active" , "ended"],
  },
});

const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session;
