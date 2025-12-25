import mongoose, { Schema, Document } from "mongoose";

//recordingId là objectId do mongoDB sinh ra

export interface IRecord extends Document {
  sessionId: string;
  fileUrl: string;
  fileSize: number;
  duration: number;
  createdAt: Date;
  aiSummary: {
    transcript: String;
  };
}

// 2. Schema (Triển khai cho Mongoose)
const recordSchema = new Schema<IRecord>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  fileUrl: { type: String, default: null },
  fileSize: { type: Number, default: null },
  duration: { type: Number, default: null },
  createdAt: Date,
  aiSummary: {
    transcript: { type: String },
  },
});

const Record = mongoose.model<IRecord>("Record", recordSchema);
export default Record;
