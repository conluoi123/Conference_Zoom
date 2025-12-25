import mongoose, { Schema, Document } from "mongoose";

export interface IParticipant extends Document {
  participantId: string;
  sessionId: string;
  displayName: string;
  role: "host" | "co-host" | "participant";
  joinTime: Date;
  leaveTime: Date;
}

const participantSchema = new Schema<IParticipant>({
  participantId: {
    type: String,
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
  },
  displayName: {
    type: String,
  },
  role: {
    type: String,
    enum: ["host", "co-host", "participant"],
    default: "participant",
  },
  joinTime: { type: Date },
  leaveTime: { type: Date },
});

const Participant = mongoose.model<IParticipant>(
  "Participant",
  participantSchema
);
export default Participant;
