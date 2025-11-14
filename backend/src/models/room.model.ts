import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  hostId: string;
  attendeesId: string[];
  isProtected: boolean;
  password?: string;
  maxParticipants: number;
  currentParticipants: number;
  status: "waiting" | "ongoing" | "ended";
  type: "instant" | "scheduled";
  scheduledAt?: Date; // thêm ngày cho scheduled
  createdAt: Date;
}

const roomSchema: Schema<IRoom> = new Schema({
  roomId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },
  attendeesId: { type: [String], default: [] },
  isProtected: { type: Boolean, default: false },
  password: { type: String },
  maxParticipants: { type: Number, required: true },
  currentParticipants: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["waiting", "ongoing", "ended"],
    default: "waiting",
    required: true,
  },
  type: {
    type: String,
    enum: ["instant", "scheduled"],
    required: true,
  },
  scheduledAt: {
    type: Date,
    required: function () {
      return this.type === "scheduled"; // chỉ required nếu scheduled
    },
  },
  createdAt: { type: Date, default: () => new Date() },
});

// index để roomId duy nhất
roomSchema.index({ roomId: 1 }, { unique: true });

const Room: Model<IRoom> = mongoose.model<IRoom>("Room", roomSchema);

export default Room;
