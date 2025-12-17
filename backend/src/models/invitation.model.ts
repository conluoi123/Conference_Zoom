import mongoose, { Schema, Document } from "mongoose";

export interface IInvitation extends Document {
  invitationId: String;
  scheduleId: String;
  email: String;
  userId: String;
  joinLink: String;
  status: "pending" | "accepted" | "declined";
  sentAt: Date;
}

const schemaInvitation = new Schema<IInvitation>({
  invitationId: {
    type: String,
    required: true,
  },
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
