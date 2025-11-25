import mongoose, { Schema, Document } from "mongoose";

// 1. Interface (Copy từ thiết kế của bạn)
export interface IRecord extends Document {
  roomId: string;
  sessionId: string;
  sharedUsers: string[];
  fileUrl: string;
}

// 2. Schema (Triển khai cho Mongoose)
const recordSchema = new Schema<IRecord>({
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

  sharedUsers: { type: [String], default: [] },

  fileUrl: { type: String },
});

const Record = mongoose.model<IRecord>("Record", recordSchema);
export default Record;
