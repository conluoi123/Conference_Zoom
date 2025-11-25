import mongoose, { Schema, Document } from "mongoose";

// 1. Interface (Copy từ thiết kế của bạn)
export interface ISession extends Document {
  roomId: string;
  sessionId: string;
  start: Date;
  end: Date;
  invitedUsers: string[];
  totalParticipants: string[];
  status: string;
}

// 2. Schema (Triển khai cho Mongoose)
const sessionSchema = new Schema<ISession>({
  roomId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  start: { type: Date },
  end: { type: Date },

  invitedUsers: { type: [String], default: [] },

  totalParticipants: {
    type: [String],
    default: [],
  },

  status: {
    type: String,
    enum: ["ACTIVE", "ENDED"],
    default: "ACTIVE",
  },
});

const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session;
