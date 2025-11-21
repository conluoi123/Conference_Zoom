import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  hostId: string;
  type: "INSTANT" | "SCHEDULED";
  startTime?: Date;
  title?: string;
  status: "ACTIVE" | "ENDED"; //Dùng để đánh dấu là đang họp hay đã kết thúc
  createdAt: Date;
  lastUsedAt?: Date;
}

const roomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },

  type: {
    type: String,
    enum: ["INSTANT", "SCHEDULED"],
    default: "INSTANT",
  },

  startTime: { type: Date },

  title: { type: String },

  status: {
    type: String,
    enum: ["ACTIVE", "ENDED"],
    default: "ACTIVE",
  },

  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date },
});

// 3. Export Model
const Room = mongoose.model<IRoom>("Room", roomSchema);
export default Room;
