import { ENV } from "../configs/env";
import User from "../models/user.model";
import {supportSendOtp, generateOtp, supportVerifyOtp} from "../services/signIn.services"
import { Request, Response } from "express";
import crypto from "crypto"
import jwt from "jsonwebtoken"

const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
async function sendOtp(req : Request, res : Response){
    try {
        const otp = await generateOtp();
        const email = req.body.email;
        if(!email){
            res.status(401).json({message: "Email is required"});
        }
        if(!email.match(regex)){
            console.log("Email is not valid");
            return res.status(400).json({message: "Email is not valid"});
        }
        await supportSendOtp(email, otp);
        return res.status(200).json({message: "Successfully"})
    } catch (error) {
        console.error("Send OTP Failed!!!", error)
    }
}

async function verifyEmail(req : Request, res : Response){
    const {email, otp} = req.body;
    if(!email || !otp){
        console.log("Miss otp or email");
    }
    const isVerify = await supportVerifyOtp(email, otp);
    if(isVerify === 1){
        return res.status(500).json({message: "SERVICE ERROR"});
    }
    if(isVerify === 2){
        return res.status(400).json({message: "YOUR OTP IS EXPIRED"});
    }
    if(isVerify === 3){
        return res.status(400).json({message: "YOUR OTP IS WRONG"});
    }
    let message = ""
    let user = await User.findOne({email: email});
    if(!user){
      const displayName = email.split('@')[0];
      const newUser = await User.create({
        email: email,
        displayName: displayName,
        avatar: "", // thiết kế avatar sau
        provider: "local",
        role: "user",
        createdAt: new Date(Date.now()),
        lastLoginAt: new Date(Date.now()),
        refreshToken:{
          refreshToken: crypto.randomBytes(64).toString("hex"),
          expiredTime: new Date(Date.now()+15*24*3600*1000),
        }
      });
      user = newUser;
      message = "SIGN UP SUCCESSFULLY!"
    }else{
      user.refreshToken.refreshToken = crypto.randomBytes(64).toString("hex");
      user.refreshToken.expiredTime = new Date(Date.now()+15*24*3600*1000);
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
    return res.status(200).json({message: "SUCCESS", accessToken});
}
export {sendOtp, verifyEmail}