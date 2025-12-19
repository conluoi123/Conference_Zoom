import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  displayName: string;
  avatar?: string;
  provider: "local" | "google" | "outlook";
  isActive: boolean;
  createdAt: Date;
  refreshToken: {
    refreshToken: String;
    expiredTime: Date;
  };
  accountType: {
    accType: "free" | "pro" | "enterprise";
    maxDuration: Number;
    maxParticipants: Number;
    expiredAt: Date;
  };
}

const userSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String, default: "" },

  provider: {
    type: String,
    enum: ["local", "google", "outlook"],
    required: true,
    default: "local",
  },
  isActive: { type: Boolean },
  createdAt: { type: Date, default: () => new Date() },
  refreshToken: {
    refreshToken: { type: String, required: true },
    expiredTime: { type: Date, required: true },
  },
  accountType: {
    accType: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      required: true,
      default: "local",
    },
    maxDuration: { type: Number },
    maxParticipants: { type: Number },
    expiredAt: { type: Date },
  },
});

// tạo index để tránh trùng username/email
userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
