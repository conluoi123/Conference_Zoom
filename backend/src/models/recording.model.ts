import mongoose, { Schema, Document } from "mongoose";

//recordingId là objectId do mongoDB sinh ra

export interface IRecord extends Document {
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
