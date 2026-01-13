import mongoose, { Schema, Document } from "mongoose";

//scheduleId là objectId do mongoDB sinh ra

export interface ISchedule extends Document {
  hostId: string;
  roomId: string;
  title: String;
  startTime: Date;
  endTime: Date;
  duration: Number;
} 

const scheduleSchema = new Schema<ISchedule>({
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
  endTime: { type: Date, default: null },
  duration: { type: Number },
});
const Schedule = mongoose.model<ISchedule>("Schedule", scheduleSchema);
export default Schedule;
