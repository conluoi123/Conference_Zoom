import mongoose, { Schema, Document } from "mongoose";

//recordingId là objectId do mongoDB sinh ra

/*
  thêm hai trường mới vào bảng 
  hostId: để lấy đúng video của chủ phòng, nếu ko có hostId nó sẽ lấy tất cả video trên bảng record 
  roomId: thêm để làm sessionId tạm thời khi videoSDK chưa trả về sessionId, sau đó sẽ cập nhật sau.
*/
export interface IRecord extends Document {
  sessionId: string;
  fileUrl: string;
  createdAt: Date;
  shared: string[];
  roomId: string; 
  hostId: string; 
}

// 2. Schema (Triển khai cho Mongoose)
const recordSchema = new Schema<IRecord>({
  sessionId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  roomId: {type: String, required: true },
  hostId: {type: String, required: true },
  fileUrl: { type: String, default: null },
  createdAt: { type: Date, default: null },
  shared: {
    type: [String],
    default: [],
  },
});

const Record = mongoose.model<IRecord>("Record", recordSchema);
export default Record;
