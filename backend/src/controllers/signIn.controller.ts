import { ENV } from "../configs/env";
import User from "../models/user.model";
import {
  supportSendOtp,
  generateOtp,
  supportVerifyOtp,
  createAccessToken,
  createNewUser,
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

interface RequestWithUser extends Request {
  user?: any;
  session?: any;
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
      return res.status(401).json({ error: "Miss otp or email" });
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
      const newUser = await createNewUser(
        email,
        "https://res.cloudinary.com/dz9xfcbey/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/avatars/cb9trd7wuoebrlbdhjqj",
        displayName,
        "local",
        hashRefToken
      );
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

    const data = {
      userId: user._id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
    };

    const accessToken = createAccessToken(user);
    res.cookie("refreshToken", refToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
      maxAge: 15 * 24 * 3600 * 1000,
      path: "/",
    });
    return res.status(200).json({ message: "SUCCESS", accessToken, data });
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
function DirectGoogle(req: RequestWithUser, res: Response) {
  const state = crypto.randomBytes(16).toString("hex");
  req.session.oauthState = state;
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
    return res.redirect(ggLoginURL);
  });
}

async function SignInWithGG(req: RequestWithUser, res: Response) {
  let message = "";
  try {
    const codeUser = req.query.code;
    if (!codeUser)
      return res.status(400).json({ error: "Missing code redirect_uri" });
    const stateReturn = req.query.state as string;
    const savedState = req.session.oauthState as string;
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

    const { id_token: ggIdToken } = reqGgToken.data;

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
      const newUser = await createNewUser(
        userData.email,
        userData.avatar
          ? userData.avatar
          : "https://res.cloudinary.com/dz9xfcbey/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/avatars/cb9trd7wuoebrlbdhjqj",

        userData.displayName,
        "google",
        hashRefToken
      );
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

    const accessToken = createAccessToken(user);

    res.cookie("refreshToken", refToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
      maxAge: 15 * 24 * 3600 * 1000,
      path: "/",
    });

    const data = {
      accessToken: accessToken,
      user: {
        userId: user._id,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
      },
    };

    const encodedData = encodeURIComponent(JSON.stringify(data));
    return res.redirect(`${ENV.FRONTEND_URL}/home?data=${encodedData}`);
  } catch (err) {
    console.log(err);
    return res
      .status(401)
      .json({ error: "Cannot Sign In/ Sign Up with Google" });
  }
}
export {
  RequestWithUser,
  sendOtp,
  verifyEmail,
  passport,
  SignInWithGG,
  DirectGoogle,
};
