import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { RequestWithUser } from "../controllers/signIn.controller";
import jwt from "jsonwebtoken"
import { ENV } from "../configs/env";
import User from "../models/user.model";

function setCsrfToken(req: RequestWithUser, res: Response, next: NextFunction) {
    if (!req.session.csrfToken) {
        req.session.csrfToken = crypto.randomBytes(64).toString('hex');
        req.session.save(); 
    }
    next();
}

function sendCsrfToken(req: RequestWithUser, res: Response) {
    const csrfToken = req.session.csrfToken; 
    if (!csrfToken) {
        return res.status(500).json({ message: "CSRF IS NOT EXIST." });
    }
    return res.status(200).json({
        csrfToken: csrfToken,
        message: "CSRF TOKEN SEND SUCCESSFULLY."
    });
}

function csrfProtection(req: RequestWithUser, res: Response, next: NextFunction) {
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
        const tokenFromHeader = req.header('X-CSRF-Token'); 
        const tokenFromSession = req.session.csrfToken;
        if (!tokenFromHeader || tokenFromHeader !== tokenFromSession) {
            if (req.session) {
                req.session.destroy(() => res.clearCookie('connect.sid')); 
            }
            return res.status(403).json({ 
                error: "CSRF TOKEN IS NOT SUITABLE",
            });
        }
    }
    next();
}

function authenticateEmail(email: string){
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email.match(regex)) {
      console.log("Email is not valid");
      return false;
    }
    return true;
}

function authenticateAccessToken(req: RequestWithUser, res: Response, next: NextFunction){
    try {
        const authorization_code = req.headers["authorization"];
        if(!authorization_code){
            return res.status(500).json({message: "ACCESS TOKEN NOT FOUND"});
        }
        const token = authorization_code.split(' ')[1];
        if(!token){
            return res.status(500).json({message: "ACCESS TOKEN NOT FOUND"});
        }
        jwt.verify(token, ENV.JWT_SECRET, async (err, decodedUser) => {
            if(err){
                console.log("ACCESS TOKEN IS EXPIRED OR WRONG");
                return res.status(403).json({message: "ACCESS TOKEN IS EXPIRED OR WRONG"});
            }
            const user = await User.findById(decodedUser._id);
            if(!user){
                console.log("USER NOT FOUND");
                return res.status(404).json({message: "USER NOT FOUND"});
            }
            req.user = user;
            next();
        });

    } catch (error) {
        console.log("ACCESS TOKEN IS EXPIRED OR WRONG", error);
        return res.status(403).json({message: "ACCESS TOKEN IS EXPIRED OR WRONG"});
    }
}



export {authenticateAccessToken, authenticateEmail, setCsrfToken, sendCsrfToken, csrfProtection}