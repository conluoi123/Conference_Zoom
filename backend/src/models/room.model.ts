import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  roomId: string;
  hostId: string;
  type: "INSTANT" | "SCHEDULED";
  title?: string;
  settings: {
    allowJoin: Boolean;
    allowShareScreen: Boolean;
    allowChat: Boolean;
    allowMic: Boolean;
    allowCam: Boolean;
  };
  invited: string[];
  createdAt: Date;
  lastUsedAt: Date;
}

const roomSchema = new Schema<IRoom>({
  roomId: { type: String, required: true, unique: true },
  hostId: { type: String, required: true },

  type: {
    type: String,
    enum: ["INSTANT", "SCHEDULED"],
    default: "INSTANT",
  },

  title: { type: String },
  settings: {
    allowJoin: { type: Boolean, default: false },
    allowShareScreen: { type: Boolean, default: true },
    allowChat: { type: Boolean, default: true },
    allowMic: { type: Boolean, default: true },
    allowCam: { type: Boolean, default: true },
  },

  invited: [{ type: String, default: [] }],

  createdAt: { type: Date, default: Date.now },
  lastUsedAt: { type: Date, default: null },
});

// 3. Export Model
const Room = mongoose.model<IRoom>("Room", roomSchema);
export default Room;
