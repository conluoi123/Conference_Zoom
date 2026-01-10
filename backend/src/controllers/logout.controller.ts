import { Request, Response } from "express";
import User from "../models/user.model";
import crypto from "crypto";

export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      console.log(refreshToken)
      return res.status(401).json({ message: "Refresh token is not valid" });
    }
    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    const user = await User.findOne({ hashRefreshToken });
    if (user) {
      await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
    });
  }
};
