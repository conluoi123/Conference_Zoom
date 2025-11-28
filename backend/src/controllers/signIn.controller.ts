import { ENV } from "../configs/env";
import User from "../models/user.model";
import {
  supportSendOtp,
  generateOtp,
  supportVerifyOtp,
} from "../services/signIn.services";
import { Request, Response } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { outlookLogIn } from "../services/signIn.services";
import { verifyGoogleToken } from "../services/signIn.services";
import axios from "axios";
import { authenticateEmail } from "../middlewares/signIn.middleware";
import { redisClient } from "../configs/redisUpstash";
interface RequestWithUser extends Request {
  user: any;
  session: any;
}
async function sendOtp(req: Request, res: Response) {
  try {
    const otp = await generateOtp();
    const email = req.body.email as string;
    if (!email) {
      return res.status(401).json({ message: "Email is required" });
    }
    if (!authenticateEmail(email)) {
      return res.status(400).json({ message: "Email is not valid" });
    }
    await supportSendOtp(email, otp);
    return res.status(200).json({ message: "Successfully" });
  } catch (error) {
    console.error("Send OTP Failed!!!", error);
  }
}

async function verifyEmail(req: Request, res: Response) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      console.log("Miss otp or email");
      return res.status(401).json({error: "Miss otp or email"})
    }
    const isVerify = await supportVerifyOtp(email, otp);
    if (isVerify === 1) {
      return res.status(500).json({ message: "SERVICE ERROR" });
    }
    if (isVerify === 2) {
      return res.status(400).json({ message: "YOUR OTP IS EXPIRED" });
    }
    if (isVerify === 3) {
      return res.status(400).json({ message: "YOUR OTP IS WRONG" });
    }
    let message = "";
    let user = await User.findOne({ email: email });
    const refToken = crypto.randomBytes(64).toString("hex");
    const hashRefToken = crypto
      .createHash("sha256")
      .update(refToken)
      .digest("hex");
    if (!user) {
      const displayName = email.split("@")[0];
      const newUser = await User.create({
        email: email,
        displayName: displayName,
        avatar: "", // thiết kế avatar sau
        provider: "local",
        // role: "user",
        createdAt: new Date(Date.now()),
        lastLoginAt: new Date(Date.now()),
        refreshToken: {
          refreshToken: hashRefToken,
          expiredTime: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        },
      });
      user = newUser;
      message = "SIGN UP SUCCESSFULLY!";
    } else {
      user.refreshToken.refreshToken = hashRefToken;
      user.refreshToken.expiredTime = new Date(
        Date.now() + 15 * 24 * 3600 * 1000
      );
      message = "SIGN IN SUCCESSFULLY!";
      await user.save();
    }

    const tokenPayLoad = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(tokenPayLoad, ENV.JWT_SECRET, {
      expiresIn: "15m",
    });
    res.cookie("refreshToken", refToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
      maxAge: 15 * 24 * 3600 * 1000,
      path: "/",
    });
    return res.status(200).json({ message: "SUCCESS", accessToken });
  } catch (error) {
    console.error("Verify OTP Failed!!!", error);
  }
}

//OUTLOOK
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select("-password");
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(
  new MicrosoftStrategy(
    {
      clientID: ENV.OUTLOOK_APP_ID,
      clientSecret: ENV.OUTLOOK_APP_SECRET,
      callbackURL: ENV.OUTLOOK_REDIRECT_URL,
      scope: ["user.read", "openid", "profile", "email"],
    },
    outlookLogIn
  )
);

//GOOGLE
async function DirectGoogle(req: RequestWithUser, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;
  // console.log(req.session.oauthState);
  // console.log(111)
  await redisClient.setEx(`state:${state}`, 180, state);
  req.session.save((Error) => {
    if (Error) {
      console.error("Session save error:", Error);
      return res.status(500).json({ error: "Session error" });
    }

    const param = new URLSearchParams({
      client_id: ENV.GOOGLE_CLIENT_ID,
      redirect_uri: ENV.GOOGLE_REDIRECT_URL,
      response_type: "code",
      scope: "email profile openid",
      state: state,
    });

    const ggLoginURL = `${ENV.GOOGLE_LOGIN_URL}?${param.toString()}`;
    console.log("Redirect URL:", ggLoginURL);
    // return window.
    // return res.redirect(ggLoginURL);
    return res.status(200).json({redirect_url: ggLoginURL, state: state})
  });
}

async function SignInWithGG(req: RequestWithUser, res: Response) {
  let message = "";
  try {
    const codeUser = req.query.code;
    if (!codeUser)
      return res.status(400).json({ error: "Missing code redirect_uri" });
    const stateReturn = req.query.state as string;
    if(req.session){
      console.log(req.session.name);
    }
    console.log(stateReturn);
    console.log(req.query.state);
    console.log("typeof =", typeof stateReturn);
    console.log("typeof =", typeof req.query.state);
    console.log("isArray =", Array.isArray(stateReturn));
    console.log(req.session.oauthState)
    // const savedState = req.session.oauthState as string;
    const savedState = await redisClient.get(`state:${stateReturn}`)
    await redisClient.del(`state:${stateReturn}`);
    console.log(savedState)
    if (!stateReturn) {
      console.log(1);
    }
    if (stateReturn !== savedState) {
      console.log(2);
    }
    if (!stateReturn || stateReturn !== savedState) {
      if (req.session) {
        await new Promise((resolve) => req.session.destroy(resolve));
        res.clearCookie("connect.sid");
      }
      return res
        .status(403)
        .json({ error: "State is not suitable, CSRF attack detected." });
    }
    if (req.session) {
      await new Promise((resolve) => req.session.destroy(resolve));
      res.clearCookie("connect.sid");
    }
    const reqGgToken = await axios.post("https://oauth2.googleapis.com/token", {
      code: codeUser,
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_SECRET_ID,
      redirect_uri: ENV.GOOGLE_REDIRECT_URL,
      grant_type: "authorization_code",
    });

    const {
      // access_token: ggAccessToken,
      id_token: ggIdToken,
      // refresh_token: ggRefreshToken
    } = reqGgToken.data;

    if (!ggIdToken) return res.status(400).json({ error: "Missing id_token" });
    const ggUser = await verifyGoogleToken(ggIdToken);

    const userData = {
      email: ggUser.email,
      displayName: ggUser.name,
      avatar: ggUser.picture,
    };

    let user = await User.findOne({ email: userData.email });
    const refToken = crypto.randomBytes(64).toString("hex");
    const hashRefToken = crypto
      .createHash("sha256")
      .update(refToken)
      .digest("hex");
    if (!user) {
      const newUser = await User.create({
        email: userData.email,
        displayName: userData.displayName,
        avatar: userData.avatar,
        provider: "google",
        // role: "user",
        createdAt: new Date(Date.now()),
        lastLoginAt: new Date(Date.now()),
        refreshToken: {
          refreshToken: hashRefToken,
          expiredTime: new Date(Date.now() + 15 * 24 * 3600 * 1000),
        },
        // ggRefreshToken:  {
        //     refreshToken: ggRefreshToken ? ggRefreshToken : undefined,
        //     expiredTime: ggRefreshToken ? new Date(Date.now()+6*30*24*3600*1000) : undefined,
        // }
      });
      user = newUser;
      message = "SIGN UP SUCCESSFULLY!";
    } else {
      user.refreshToken.refreshToken = hashRefToken;
      user.refreshToken.expiredTime = new Date(
        Date.now() + 15 * 24 * 3600 * 1000
      );
      // if(ggRefreshToken){
      //   user.ggRefreshToken.refreshToken = ggRefreshToken;
      //   user.ggRefreshToken.expiredTime = new Date(Date.now()+6*30*24*3600*1000);
      // }
      message = "SIGN IN SUCCESSFULLY!";
      await user.save();
    }

    const tokenPayLoad = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(tokenPayLoad, ENV.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("refreshToken", refToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
      maxAge: 15 * 24 * 3600 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message,
      access_token: accessToken,
      // google_access_token: ggAccessToken,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ error: "Cannot Sign In/ Sign Up with Google" });
  }
}
export { RequestWithUser, sendOtp, verifyEmail, passport, SignInWithGG, DirectGoogle };
