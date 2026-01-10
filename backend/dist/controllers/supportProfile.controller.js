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
exports.saveAvatar = saveAvatar;
exports.signatureCloudinary = signatureCloudinary;
const env_1 = require("../configs/env");
const crypto_1 = __importDefault(require("crypto"));
const supportProfile_services_1 = require("../services/supportProfile.services");
function signatureCloudinary(req, res) {
    try {
        // doi ra giay timestamp la thoi sang song cua sign (ttl)
        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `folder=avatars&timestamp=${timestamp}${env_1.ENV.CLOUDINARY_SECRET_KEY}`;
        const signature = crypto_1.default
            .createHash("sha1")
            .update(stringToSign)
            .digest("hex");
        return res.status(200).json({
            signature,
            timestamp,
            apiKey: env_1.ENV.CLOUDINARY_API_KEY,
            cloudName: env_1.ENV.CLOUDINARY_NAME,
        });
    }
    catch (error) {
        console.error("Error when get sign ");
        return res.status(500).json({ message: "Internal Server Error" });
    }
}
function saveAvatar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId, publicId } = req.body;
            if (!publicId) {
                return res.status(400);
            }
            const optimizedUrl = `https://res.cloudinary.com/${env_1.ENV.CLOUDINARY_NAME}/image/upload/f_auto,q_auto,w_400,h_400,c_fill,g_center/${publicId}`;
            const val = yield (0, supportProfile_services_1.saveUrl)(optimizedUrl, userId);
            if (val === 0) {
                res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({ url: optimizedUrl });
        }
        catch (error) {
            console.error(error);
        }
    });
}
