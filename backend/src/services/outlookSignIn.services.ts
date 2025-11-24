import User from "../models/user.model";
import crypto from "crypto"
import { Response, Request } from "express";
import jwt from "jsonwebtoken"
import { ENV } from "../configs/env";
let isLogIn = false;
async function outlookLogIn(accessToken, refreshToken, profile, done) {
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
    if (!profile.id) {
        return done(new Error("No ID found"), null);
    }
    try {
        let user = await User.findOne({email: email});
        if(user){
            isLogIn = true;
            user.avatar = avatar;
            user.displayName = profile.displayName;
            user.lastLoginAt = new Date(Date.now());
            await user.save();
            return done(null, user);
        }else{
            const newUser = await User.create({
                email: email,
                displayName: profile.displayName,
                avatar: avatar,
                provider: "outlook",
                role: "user",
                createdAt: new Date(Date.now()),
                lastLoginAt: new Date(Date.now()),
                refreshToken:{
                    refreshToken: crypto.randomBytes(64).toString("hex"),
                    expiredTime: new Date(Date.now()+15*24*3600*1000)
                }
            })
            user = newUser;
            return done(null, user);
        }
    } catch (error) {
        console.log("loi: ", error);
        return done(new Error("Cannot signin/ signup with outlook"), null);
    }
}

async function outlookLogInCallback(req: Request, res: Response){
    interface RequestWithUser extends Request {
        user: any;
    }
    const user = (req as RequestWithUser).user as any;
    const tokenPayLoad = {
        id: user._id, 
        email: user.email,
    }
    const accessToken = jwt.sign(tokenPayLoad, ENV.JWT_SECRET, { expiresIn: '15m' });
    if(user.refreshToken.expiredTime < Date.now()){
        user.refreshToken.refreshToken = crypto.randomBytes(64).toString("hex");
        user.refreshToken.expiredTime = new Date(Date.now()+15*24*3600*1000);
        await user.save();
    }
    res.cookie("refreshToken", user.refreshToken.refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 24 * 3600 * 1000,
            path: "/",
    });
    let message = isLogIn ? "LOGIN SUCCESSFUL" : "SIGN UP SUCCESSFUL";

    return res.status(200).json({
        message: message,
        access_token: accessToken,
        user_data: {
            id: user._id,
            displayName: user.displayName,
            avatar: user.avatar
        }
    });
}
export {outlookLogIn, outlookLogInCallback}