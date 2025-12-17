import mongoose, { Schema, Document } from "mongoose";

// 1. Interface (Copy từ thiết kế của bạn)
export interface IRecord extends Document {
  recordingId: String;
  sessionId: String;
  fileUrl: String;
  fileSize: Number;
  duration: Number;
  createdAt: Date;
  aiSummary: {
    transcript: String;
  };
}

// 2. Schema (Triển khai cho Mongoose)
const recordSchema = new Schema<IRecord>({
  recordingId: {
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

  fileUrl: { type: String },
  fileSize: { type: Number },
  duration: { type: Number },
  createdAt: Date,
  aiSummary: {
    transcript: { type: String },
  },
});

const Record = mongoose.model<IRecord>("Record", recordSchema);
export default Record;
