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
exports.isExistsRefreshToken = isExistsRefreshToken;
const crypto_1 = __importDefault(require("crypto"));
const signIn_services_1 = require("../services/signIn.services");
const user_model_1 = __importDefault(require("../models/user.model"));
function refreshAccessToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({ message: "Refresh token is wrong" });
            }
            const hashRefreshToken = crypto_1.default
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");
            const user = yield user_model_1.default.findOne({
                "refreshToken.refreshToken": hashRefreshToken,
            });
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "refresh token is expired or wrong" });
            }
            const newRefreshToken = yield (0, signIn_services_1.createRefreshTokenAndStorageInDb)(user);
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "none",
                maxAge: 15 * 24 * 3600 * 1000,
                path: "/",
            });
            const newAccessToken = (0, signIn_services_1.createAccessToken)(user);
            return res.status(200).json({ accessToken: newAccessToken });
        }
        catch (error) {
            console.log("REFRESH TOKEN IS EXPIRED OR WRONG", error);
            return res
                .status(401)
                .json({ message: "ACCESS TOKEN IS EXPIRED OR WRONG" });
        }
    });
}
function isExistsRefreshToken(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res
                    .status(401)
                    .json({ message: "Refresh token is wrong", flag: false });
            }
            const hashRefreshToken = crypto_1.default
                .createHash("sha256")
                .update(refreshToken)
                .digest("hex");
            const user = yield user_model_1.default.findOne({
                "refreshToken.refreshToken": hashRefreshToken,
            });
            if (!user) {
                return res
                    .status(401)
                    .json({ message: "refresh token is expired or wrong", flag: false });
            }
            return res.status(200).json({ flag: true });
        }
        catch (error) {
            console.log("REFRESH TOKEN IS EXPIRED OR NOT EXISTS", error);
            return res
                .status(401)
                .json({ message: "REFRESH TOKEN IS EXPIRED OR NOT EXISTS", flag: false });
        }
    });
}
exports.default = refreshAccessToken;
