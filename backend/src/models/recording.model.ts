import mongoose, { Schema, Document } from "mongoose";

//recordingId là objectId do mongoDB sinh ra

export interface IRecord extends Document {
  sessionId: string;
  fileUrl: string;
  createdAt: Date;
  shared: string[];
}

// 2. Schema (Triển khai cho Mongoose)
const recordSchema = new Schema<IRecord>({
  sessionId: {
    type: String,
    required: true,
  },
  fileUrl: { type: String, default: null },
  createdAt: { type: Date, default: null },
  shared: {
    type: [String],
    default: [],
  },
});

const Record = mongoose.model<IRecord>("Record", recordSchema);
export default Record;
