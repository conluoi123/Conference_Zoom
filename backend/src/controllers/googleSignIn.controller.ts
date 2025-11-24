// https://developers.google.com/oauthplayground
// nếu bị lỗi Cannot Sign In/ Sign Up with Google thì thêm prompt=consent vào url req để google gửi lại refreshcode
/*Test API: https://accounts.google.com/o/oauth2/v2/auth?
client_id=YOUR_CLIENT_ID_HERE
&redirect_uri=YOUR_REDIRECT_URL_HERE
&response_type=code
&scope=email%20profile%20openid
&access_type=offline
&prompt=consent*/ 
import { verifyGoogleToken } from "../services/googleSignUp.services";
import { ENV } from "../configs/env";
import { Request, Response } from "express";
import crypto from "crypto"
import jwt from "jsonwebtoken"
import User from "../models/user.model";
import axios from "axios"
async function SignInWithGG (req: Request, res: Response){
  let message = "";
  try {
    const codeUser = req.query.code; 
    if (!codeUser) return res.status(400).json({ error: "Missing code redirect_uri" });

    //gui post toi google de lay 
    const reqGgToken = await axios.post("https://oauth2.googleapis.com/token", {
      code: codeUser,
      client_id: ENV.GOOGLE_CLIENT_ID,
      client_secret: ENV.GOOGLE_SECRET_ID,
      redirect_uri: ENV.GOOGLE_REDIRECT_URL,
      grant_type: "authorization_code"
    });

    const {
      access_token: ggAccessToken,
      id_token: ggIdToken,
      refresh_token: ggRefreshToken
    } = reqGgToken.data;


    if (!ggIdToken) return res.status(400).json({ error: "Missing id_token" });
    const ggUser = await verifyGoogleToken(ggIdToken);

    const userData = {
      email: ggUser.email,
      displayName: ggUser.name,
      avatar: ggUser.picture,
    };

    let user = await User.findOne({email: userData.email});

    if(!user){
      const newUser = await User.create({
        email: userData.email,
        displayName: userData.displayName,
        avatar: userData.avatar,
        provider: "google",
        role: "user",
        createdAt: new Date(Date.now()),
        lastLoginAt: new Date(Date.now()),
        refreshToken:{
          refreshToken: crypto.randomBytes(64).toString("hex"),
          expiredTime: new Date(Date.now()+15*24*3600*1000),
        },
        ggRefreshToken:  {
            refreshToken: ggRefreshToken ? ggRefreshToken : undefined,
            expiredTime: ggRefreshToken ? new Date(Date.now()+6*30*24*3600*1000) : undefined,
        }
      });
      user = newUser;
      message = "SIGN UP SUCCESSFULLY!"
    }else{
      user.refreshToken.refreshToken = crypto.randomBytes(64).toString("hex");
      user.refreshToken.expiredTime = new Date(Date.now()+15*24*3600*1000);
      if(ggRefreshToken){
        user.ggRefreshToken.refreshToken = ggRefreshToken;
        user.ggRefreshToken.expiredTime = new Date(Date.now()+6*30*24*3600*1000);
      }
      message = "SIGN IN SUCCESSFULLY!"
      await user.save();
    }

    const tokenPayLoad = {
      id: user._id,
      email: user.email,
    }

    const accessToken = jwt.sign(tokenPayLoad, ENV.JWT_SECRET, {expiresIn: '15m'});

    res.cookie("refreshToken", user.refreshToken.refreshToken,{
      httpOnly: true,
      secure: true,
      sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
      maxAge: 15*24*3600*1000,
      path: "/",
    });

    return res.status(200).json({
      message,
      access_token: accessToken,
      google_access_token: ggAccessToken,
    });
  } catch (err) {
    console.log(err)
    return res.status(401).json({ error: "Cannot Sign In/ Sign Up with Google" });
  }
}
export { SignInWithGG }