import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  password?: string; // required nếu provider = local
  email: string;
  displayName: string;
  avatar?: string;
  provider: "local" | "google" | "github";
  providerId?: string; // required nếu provider != local
  isVerified: boolean;
  role: "user" | "admin";
  createdAt: Date;
  lastLoginAt?: Date;
}

const userSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    }, // chỉ required nếu local
  },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String, default: "" },

  provider: {
    type: String,
    enum: ["local", "google", "github"],
    required: true,
    default: "local",
  },

  providerId: {
    type: String,
    required: function () {
      return this.provider !== "local";
    },
  },

  isVerified: { type: Boolean, default: false },

  role: { type: String, enum: ["user", "admin"], default: "user" },

  createdAt: { type: Date, default: () => new Date() },
  lastLoginAt: { type: Date },
});

// tạo index để tránh trùng username/email
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
