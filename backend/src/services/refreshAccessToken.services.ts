import { Response } from "express";
import { RequestWithUser } from "../controllers/signIn.controller";
import crypto from "crypto";
import {
  createAccessToken,
  createRefreshTokenAndStorageInDb,
} from "../services/signIn.services";
import User from "../models/user.model";
async function refreshAccessToken(req: RequestWithUser, res: Response) {
  try {
    const refreshToken = req.cookies.refreshToken;
    // console.log(`loi la reff ${refreshToken}`);
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token is wrong" });
    }
    
    const hashRefreshToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    console.log(hashRefreshToken);
    const user = await User.findOne({
      "refreshToken.refreshToken": hashRefreshToken,
    });
    console.log(` loi la ${user}`)
    if (!user) {
      return res
        .status(401)
        .json({ message: "refresh token is expired or wrong" });
    }
    const newRefreshToken = await createRefreshTokenAndStorageInDb(user);
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 24 * 3600 * 1000,
      path: "/",
    });
    const newAccessToken = createAccessToken(user);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.log("REFRESH TOKEN IS EXPIRED OR WRONG", error);
    return res
      .status(401)
      .json({ message: "ACCESS TOKEN IS EXPIRED OR WRONG" });
  }
}
export default refreshAccessToken