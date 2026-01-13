import mongoose, { Schema, Document } from "mongoose";

//invitationId là objectId do mongoDB sinh ra
export interface IInvitation extends Document {
  scheduleId: string;
  email: string;
  joinLink: string;
  status: "pending" | "accepted" | "declined";
  sentAt: Date;
  expiresAt: Date;
}

const invitationSchema = new Schema<IInvitation>({
  scheduleId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  joinLink: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
  },
  sentAt: { type: Date },

  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 },
  },
});

const Invitation = mongoose.model<IInvitation>("Invitation", invitationSchema);
export default Invitation;
