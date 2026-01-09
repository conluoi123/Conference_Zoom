"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportSendOtp = supportSendOtp;
exports.generateOtp = generateOtp;
exports.supportVerifyOtp = supportVerifyOtp;
exports.createNewUser = createNewUser;
exports.outlookLogIn = outlookLogIn;
exports.outlookLogInCallback = outlookLogInCallback;
exports.verifyGoogleToken = verifyGoogleToken;
exports.createAccessToken = createAccessToken;
exports.createRefreshTokenAndStorageInDb = createRefreshTokenAndStorageInDb;
const env_1 = require("../configs/env");
const nodeMailer_1 = __importDefault(require("../configs/nodeMailer"));
const redisUpstash_1 = require("../configs/redisUpstash");
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const google_auth_library_1 = require("google-auth-library");
function generateOtp() {
    return __awaiter(this, void 0, void 0, function* () {
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        return otp;
    });
}
function supportSendOtp(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otp_pre = "otp:";
            const otp_attempt_pre = "otp_attempt:";
            const attempts = yield redisUpstash_1.redisClient.get(otp_attempt_pre + email);
            if (attempts && parseInt(attempts) >= 3) {
                throw new Error("Too many OTP requests. Please try again after 5 minutes.");
            }
            yield redisUpstash_1.redisClient.setEx(otp_pre + email, 180, otp);
            const cntAttempts = yield redisUpstash_1.redisClient.incr(otp_attempt_pre + email);
            if (cntAttempts == 1) {
                yield redisUpstash_1.redisClient.expire(otp_attempt_pre + email, 300);
            }
            yield nodeMailer_1.default.sendMail({
                from: env_1.ENV.EMAIL_FROM,
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
            return {
                success: true,
                message: "OTP sent successfully",
            };
        }
        catch (error) {
            console.error("SEND OTP FAILED!", error);
            throw error;
        }
    });
}
function supportVerifyOtp(email, otp) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!redisUpstash_1.redisClient) {
                console.error("Redis client is not initialized.");
                return 1;
            }
            const otp_pre = "otp:";
            const verify_pre = "verify_attempt:";
            const verifyAttempts = yield redisUpstash_1.redisClient.get(verify_pre + email);
            if (verifyAttempts && parseInt(verifyAttempts) >= 3) {
                yield redisUpstash_1.redisClient.del(otp_pre + email);
                return { error: "ATTEMPT TO MANY TIMES" };
            }
            const redisOtp = yield redisUpstash_1.redisClient.get(otp_pre + email);
            if (!redisOtp) {
                console.log("OTP is expired");
                return 2;
            }
            if (redisOtp !== otp) {
                const attempts = yield redisUpstash_1.redisClient.incr(verify_pre + email);
                if (attempts == 1) {
                    yield redisUpstash_1.redisClient.expire(verify_pre + email, 300);
                }
                console.log("OTP is wrong");
                return 3;
            }
            yield redisUpstash_1.redisClient.del(otp_pre + email);
            yield redisUpstash_1.redisClient.del(verify_pre + email);
            return 4;
        }
        catch (error) {
            console.error("VERIFY OTP FAILED!", error);
        }
    });
}
// OUTLOOK
function outlookLogIn(accessToken, refreshToken, profile, done) {
    return __awaiter(this, void 0, void 0, function* () {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        if (!profile.id) {
            return done(new Error("No ID found"), null);
        }
        try {
            let user = yield user_model_1.default.findOne({ email: email });
            if (user) {
                user.avatar = avatar;
                user.displayName = profile.displayName;
                yield user.save();
                return done(null, user);
            }
            else {
                const newUser = yield createNewUser(email, avatar
                    ? avatar
                    : "https://res.cloudinary.com/dz9xfcbey/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/avatars/cb9trd7wuoebrlbdhjqj", profile.displayName, "outlook", "refTokenTemp");
                user = newUser;
                return done(null, user);
            }
        }
        catch (error) {
            console.log("loi: ", error);
            return done(new Error("Cannot signin/ signup with outlook"), null);
        }
    });
}
function outlookLogInCallback(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = req.user;
        yield new Promise((resolve) => req.session.destroy(resolve));
        res.clearCookie("connect.sid");
        const accessToken = createAccessToken(user);
        const refToken = yield createRefreshTokenAndStorageInDb(user);
        res.cookie("refreshToken", refToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
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
        return res.redirect(`${env_1.ENV.FRONTEND_URL}/home?data=${encodedData}`);
    });
}
//GOOGLE
const client = new google_auth_library_1.OAuth2Client(env_1.ENV.GOOGLE_CLIENT_ID);
function verifyGoogleToken(idToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const ticket = yield client.verifyIdToken({
            idToken,
            audience: env_1.ENV.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    });
}
// hàm tạo user mới
function createNewUser(email, avatar, displayName, provider, refreshToken) {
    return __awaiter(this, void 0, void 0, function* () {
        const newUser = yield user_model_1.default.create({
            email: email,
            displayName: displayName,
            avatar: avatar,
            provider: provider,
            createdAt: new Date(Date.now()),
            isActive: true,
            refreshToken: {
                refreshToken: refreshToken,
                expiredTime: new Date(Date.now() + 15 * 24 * 3600 * 1000),
            },
            accountType: {
                accType: "free",
                maxDuration: 60,
                maxParticipants: 40,
                expiredAt: null,
            },
        });
        return newUser;
    });
}
// hàm tạo refreshToken xác thực mới và accessToken mới gủi về user
function createAccessToken(user) {
    const tokenPayLoad = {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
    };
    const accessToken = jsonwebtoken_1.default.sign(tokenPayLoad, env_1.ENV.JWT_SECRET, {
        expiresIn: "15m",
    });
    return accessToken;
}
function createRefreshTokenAndStorageInDb(user) {
    return __awaiter(this, void 0, void 0, function* () {
        const refToken = crypto_1.default.randomBytes(64).toString("hex");
        const hashRefToken = crypto_1.default
            .createHash("sha256")
            .update(refToken)
            .digest("hex");
        user.refreshToken.refreshToken = hashRefToken;
        user.refreshToken.expiredTime = new Date(Date.now() + 15 * 24 * 3600 * 1000);
        yield user.save();
        return refToken;
    });
}
//# sourceMappingURL=signIn.services.js.map