import { ENV } from "../configs/env";
import transporter from "../configs/nodeMailer";
import { redisClient } from "../configs/redisUpstash";
import crypto from "crypto";
import User from "../models/user.model";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { error } from "console";
let isLogIn = false;
interface RequestWithUser extends Request {
  user: any;
  session: any;
}
async function generateOtp() {
  const otp = crypto.randomInt(100000, 999999).toString();
  return otp;
}
async function supportSendOtp(email, otp) {
  try {
    const otp_pre = "otp:";
    const otp_attempt_pre = "otp_attempt:";
    const attempts = await redisClient.get(otp_attempt_pre + email);
    if (attempts && parseInt(attempts as string) >= 3) {
      throw new Error(
        "Too many OTP requests. Please try again after 5 minutes."
      );
    }
    await redisClient.setEx(otp_pre + email, 180, otp);
    const cntAttempts = await redisClient.incr(otp_attempt_pre + email);
    if (cntAttempts == 1) {
      await redisClient.expire(otp_attempt_pre + email, 300);
    }
    await transporter.sendMail({
      from: ENV.EMAIL_FROM,
      to: email,
      subject: "[ZUS CONFERENCE VIDEO SYSTEM] - OTP CODE",
      html: `<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Document</title>
                        <style>
                            *{
                                margin: 0;
                                padding: 0;
                            }
                            .heading{
                                text-align: center;
                                color: blue;
                                border-bottom: 1px solid black;
                                margin-bottom: 4px;
                            }
                            .container{
                                width: 500px;
                                height: 500px;
                                padding: 4px;
                            }
                            .firstContent, .notice{
                                margin-top: 0;
                                line-height: 24px;
                            }
                            .otp{
                                text-align: center;
                                color: green;
                                font-size: 40px;
                            }
                            .content{
                                border-bottom: 1px solid black;
                            }
                            .footer{
                                text-align: right; 
                                font-style: italic; 
                                opacity: 0.6;
                                margin-top: 8px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div>
                                <h1 class="heading">Email OTP</h1>
                            </div>
                            <div class="content">
                                <p class="firstContent">Dear ${email},</p>
                                <p class="secondContent">We are ZUS'staff. Someone requested access to our website using your email. Your OTP is:</p>
                                <br>
                                <h1 class="otp">${otp}</h1>
                                <br>
                                <p class="thirdContent">Please use this OTP to access to our website. Thank you for using Email OTP</p>
                                <br>
                                <p class="notice" style="color:red">NOTICE: DO NOT SHARE THIS OTP WITH ANYONE</p>
                            </div>
                            <div class="footer">
                                © ZUS Conference Room System. All rights reserved.
                            </div>
                        </div>
                    </body>
                    </html>`,
    });
    console.log("SEND OTP SUCCESSFULLY!");
    return {
      success: true,
      message: "OTP sent successfully",
    };
  } catch (error) {
    console.error("SEND OTP FAILED!", error);
    throw error;
  }
}

async function supportVerifyOtp(email, otp) {
  try {
    if (!redisClient) {
      console.error("Redis client is not initialized.");
      return 1;
    }
    const otp_pre = "otp:";
    const verify_pre = "verify_attempt:";
    const verifyAttempts = await redisClient.get(verify_pre + email);
    if (verifyAttempts && parseInt(verifyAttempts as string) >= 3) {
      await redisClient.del(otp_pre + email);
      return { error: "ATTEMPT TO MANY TIMES" };
    }
    const redisOtp = await redisClient.get(otp_pre + email);
    if (!redisOtp) {
      console.log("OTP is expired");
      return 2;
    }
    if (redisOtp !== otp) {
      const attempts = await redisClient.incr(verify_pre + email);
      if (attempts == 1) {
        await redisClient.expire(verify_pre + email, 300);
      }
      console.log("OTP is wrong");
      return 3;
    }
    await redisClient.del(otp_pre + email);
    await redisClient.del(verify_pre + email);
    return 4;
  } catch (error) {
    console.error("VERIFY OTP FAILED!", error);
  }
}

// OUTLOOK
async function outlookLogIn(accessToken, refreshToken, profile, done) {
  const email =
    profile.emails && profile.emails[0] ? profile.emails[0].value : null;
  const avatar =
    profile.photos && profile.photos[0] ? profile.photos[0].value : null;
  if (!profile.id) {
    return done(new Error("No ID found"), null);
  }
  try {
    let user = await User.findOne({ email: email });
    if (user) {
      isLogIn = true;
      user.avatar = avatar;
      user.displayName = profile.displayName;
      user.lastLoginAt = new Date(Date.now());
      await user.save();
      return done(null, user);
    } else {
      const newUser = await User.create({
        email: email,
        displayName: profile.displayName,
        avatar: avatar,
        provider: "outlook",
        // role: "user",
        createdAt: new Date(Date.now()),
        lastLoginAt: new Date(Date.now()),
        refreshToken: {
          refreshToken: "ref",
          expiredTime: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        },
      });
      user = newUser;
      return done(null, user);
    }
  } catch (error) {
    console.log("loi: ", error);
    return done(new Error("Cannot signin/ signup with outlook"), null);
  }
}

async function outlookLogInCallback(req: Request, res: Response) {
  const user = (req as RequestWithUser).user as any;
  await new Promise((resolve) =>
    (req as RequestWithUser).session.destroy(resolve)
  );
  res.clearCookie("connect.sid");
  const tokenPayLoad = {
    id: user._id,
    email: user.email,
  };
  const accessToken = jwt.sign(tokenPayLoad, ENV.JWT_SECRET, {
    expiresIn: "15m",
  });
  const refToken = crypto.randomBytes(64).toString("hex");
  const hashRefToken = crypto
    .createHash("sha256")
    .update(refToken)
    .digest("hex");
  user.refreshToken.refreshToken = hashRefToken;
  user.refreshToken.expiredTime = new Date(Date.now() + 15 * 24 * 3600 * 1000);
  await user.save();
  res.cookie("refreshToken", refToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 24 * 3600 * 1000,
    path: "/",
  });
  let message = isLogIn ? "LOGIN SUCCESSFUL" : "SIGN UP SUCCESSFUL";
  // return res.status(200).json({
  //     message: message,
  //     access_token: accessToken,
  //     user_data: {
  //         id: user._id,
  //         displayName: user.displayName,
  //         avatar: user.avatar
  //     }
  // });
  const data = {
    accessToken: accessToken,
    user:{
      userId: user._id,
      email: user.email,
      displayName: user.displayName,
    }
  };
  const encodedData = encodeURIComponent(JSON.stringify(data));
  return res.redirect(`http://localhost:5173/home?data=${encodedData}`);
}

//GOOGLE
const client = new OAuth2Client(ENV.GOOGLE_CLIENT_ID);
async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: ENV.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}
export {
  supportSendOtp,
  generateOtp,
  supportVerifyOtp,
  outlookLogIn,
  outlookLogInCallback,
  verifyGoogleToken,
};
