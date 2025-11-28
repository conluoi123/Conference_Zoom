import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  email: string;
  displayName: string;
  avatar?: string;
  provider: "local" | "google" | "facebook";
  // isVerified: boolean;
  // role: "user" | "admin";
  createdAt: Date;
  lastLoginAt?: Date;
  refreshToken: {
    refreshToken: String,
    expiredTime: Date,
  }
  // ggRefreshToken: {
  //   refreshToken?: String,
  //   expiredTime?: Date,
  // }
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

  // isVerified: { type: Boolean, default: false },

  // role: { type: String, enum: ["user", "admin"], default: "user" },

  createdAt: { type: Date, default: () => new Date() },
  lastLoginAt: { type: Date },
  refreshToken: {
    refreshToken: { type: String, required: true },
    expiredTime: { type: Date, required: true },
  },
  // ggRefreshToken: {
  //   refreshToken: { 
  //     type: String, 
  //     required: function(this: IUser) {
  //       return this.provider === "google";
  //     },
  //     default: undefined,
  //   },
  //   expiredTime: { 
  //       type: Date, 
  //       required: function(this: IUser) {
  //           return !!this.ggRefreshToken?.refreshToken;
  //       }
  //   },
  // }

});

// tạo index để tránh trùng username/email
userSchema.index({ email: 1 }, { unique: true });

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);

export default User;
