import mongoose, { Schema, Document } from "mongoose";

//invitationId là objectId do mongoDB sinh ra
export interface IInvitation extends Document {
  scheduleId: String;
  email: String;
  userId: String;
  joinLink: String;
  status: "pending" | "accepted" | "declined";
  sentAt: Date;
}

const schemaInvitation = new Schema<IInvitation>({
  scheduleId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  userId: {
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
});
