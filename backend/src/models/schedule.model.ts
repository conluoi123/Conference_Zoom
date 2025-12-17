import mongoose, { Schema, Document } from "mongoose";

export interface ISchedule extends Document {
  scheduleId: string;
  hostId: string;
  roomId: string;
  title: String;
  startTime: Date;
  duration: Number;
}

const scheduleSchema = new Schema<ISchedule>({
  scheduleId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  title: { type: String },
  startTime: { type: Date },
  duration: { type: Number },
});     
const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
export default Schedule