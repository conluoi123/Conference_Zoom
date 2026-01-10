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
exports.passport = void 0;
exports.sendOtp = sendOtp;
exports.verifyEmail = verifyEmail;
exports.SignInWithGG = SignInWithGG;
exports.DirectGoogle = DirectGoogle;
const env_1 = require("../configs/env");
const user_model_1 = __importDefault(require("../models/user.model"));
const signIn_services_1 = require("../services/signIn.services");
const crypto_1 = __importDefault(require("crypto"));
const passport_1 = __importDefault(require("passport"));
exports.passport = passport_1.default;
const passport_microsoft_1 = require("passport-microsoft");
const signIn_services_2 = require("../services/signIn.services");
const signIn_services_3 = require("../services/signIn.services");
const axios_1 = __importDefault(require("axios"));
const signIn_middleware_1 = require("../middlewares/signIn.middleware");
function sendOtp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const otp = yield (0, signIn_services_1.generateOtp)();
            const email = req.body.email;
            if (!email) {
                return res.status(401).json({ message: "Email is required" });
            }
            if (!(0, signIn_middleware_1.authenticateEmail)(email)) {
                return res.status(400).json({ message: "Email is not valid" });
            }
            yield (0, signIn_services_1.supportSendOtp)(email, otp);
            return res.status(200).json({ message: "Successfully" });
        }
        catch (error) {
            console.error("Send OTP Failed!!!", error);
        }
    });
}
function verifyEmail(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, otp } = req.body;
            if (!email || !otp) {
                return res.status(401).json({ error: "Miss otp or email" });
            }
            const isVerify = yield (0, signIn_services_1.supportVerifyOtp)(email, otp);
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
            let user = yield user_model_1.default.findOne({ email: email });
            const refToken = crypto_1.default.randomBytes(64).toString("hex");
            const hashRefToken = crypto_1.default
                .createHash("sha256")
                .update(refToken)
                .digest("hex");
            if (!user) {
                const displayName = email.split("@")[0];
                const newUser = yield (0, signIn_services_1.createNewUser)(email, "https://res.cloudinary.com/dz9xfcbey/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/avatars/cb9trd7wuoebrlbdhjqj", displayName, "local", hashRefToken);
                user = newUser;
                message = "SIGN UP SUCCESSFULLY!";
            }
            else {
                user.refreshToken.refreshToken = hashRefToken;
                user.refreshToken.expiredTime = new Date(Date.now() + 15 * 24 * 3600 * 1000);
                message = "SIGN IN SUCCESSFULLY!";
                yield user.save();
            }
            const data = {
                userId: user._id,
                email: user.email,
                displayName: user.displayName,
                avatar: user.avatar,
            };
            const accessToken = (0, signIn_services_1.createAccessToken)(user);
            res.cookie("refreshToken", refToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
                maxAge: 15 * 24 * 3600 * 1000,
                path: "/",
            });
            return res.status(200).json({ message: "SUCCESS", accessToken, data });
        }
        catch (error) {
            console.error("Verify OTP Failed!!!", error);
        }
    });
}
//OUTLOOK
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(id).select("-password");
        done(null, user);
    }
    catch (err) {
        done(err);
    }
}));
passport_1.default.use(new passport_microsoft_1.Strategy({
    clientID: env_1.ENV.OUTLOOK_APP_ID,
    clientSecret: env_1.ENV.OUTLOOK_APP_SECRET,
    callbackURL: env_1.ENV.OUTLOOK_REDIRECT_URL,
    scope: ["user.read", "openid", "profile", "email"],
}, signIn_services_2.outlookLogIn));
//GOOGLE
function DirectGoogle(req, res) {
    const state = crypto_1.default.randomBytes(16).toString("hex");
    req.session.oauthState = state;
    req.session.save((Error) => {
        if (Error) {
            console.error("Session save error:", Error);
            return res.status(500).json({ error: "Session error" });
        }
        const param = new URLSearchParams({
            client_id: env_1.ENV.GOOGLE_CLIENT_ID,
            redirect_uri: env_1.ENV.GOOGLE_REDIRECT_URL,
            response_type: "code",
            scope: "email profile openid",
            state: state,
        });
        const ggLoginURL = `${env_1.ENV.GOOGLE_LOGIN_URL}?${param.toString()}`;
        return res.redirect(ggLoginURL);
    });
}
function SignInWithGG(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let message = "";
        try {
            const codeUser = req.query.code;
            if (!codeUser)
                return res.status(400).json({ error: "Missing code redirect_uri" });
            const stateReturn = req.query.state;
            const savedState = req.session.oauthState;
            if (!stateReturn || stateReturn !== savedState) {
                if (req.session) {
                    yield new Promise((resolve) => req.session.destroy(resolve));
                    res.clearCookie("connect.sid");
                }
                return res
                    .status(403)
                    .json({ error: "State is not suitable, CSRF attack detected." });
            }
            if (req.session) {
                yield new Promise((resolve) => req.session.destroy(resolve));
                res.clearCookie("connect.sid");
            }
            const reqGgToken = yield axios_1.default.post("https://oauth2.googleapis.com/token", {
                code: codeUser,
                client_id: env_1.ENV.GOOGLE_CLIENT_ID,
                client_secret: env_1.ENV.GOOGLE_SECRET_ID,
                redirect_uri: env_1.ENV.GOOGLE_REDIRECT_URL,
                grant_type: "authorization_code",
            });
            const { id_token: ggIdToken } = reqGgToken.data;
            if (!ggIdToken)
                return res.status(400).json({ error: "Missing id_token" });
            const ggUser = yield (0, signIn_services_3.verifyGoogleToken)(ggIdToken);
            const userData = {
                email: ggUser.email,
                displayName: ggUser.name,
                avatar: ggUser.picture,
            };
            let user = yield user_model_1.default.findOne({ email: userData.email });
            const refToken = crypto_1.default.randomBytes(64).toString("hex");
            const hashRefToken = crypto_1.default
                .createHash("sha256")
                .update(refToken)
                .digest("hex");
            if (!user) {
                const newUser = yield (0, signIn_services_1.createNewUser)(userData.email, userData.avatar
                    ? userData.avatar
                    : "https://res.cloudinary.com/dz9xfcbey/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/avatars/cb9trd7wuoebrlbdhjqj", userData.displayName, "google", hashRefToken);
                user = newUser;
                message = "SIGN UP SUCCESSFULLY!";
            }
            else {
                user.refreshToken.refreshToken = hashRefToken;
                user.refreshToken.expiredTime = new Date(Date.now() + 15 * 24 * 3600 * 1000);
                message = "SIGN IN SUCCESSFULLY!";
                yield user.save();
            }
            const accessToken = (0, signIn_services_1.createAccessToken)(user);
            res.cookie("refreshToken", refToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none", // none là fe và be không cùng 1 url nếu cùng thì là "strict"
                maxAge: 15 * 24 * 3600 * 1000,
                path: "/",
            });
            return res.redirect(`${env_1.ENV.FRONTEND_URL}/home`);
        }
        catch (err) {
            console.log(err);
            return res
                .status(401)
                .json({ error: "Cannot Sign In/ Sign Up with Google" });
        }
    });
}
