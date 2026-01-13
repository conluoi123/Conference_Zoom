"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("../configs/env");
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: env_1.ENV.EMAIL_USER,
        pass: env_1.ENV.EMAIL_PASS,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.error("Email config error. Check HOST, PORT, and APP PASSWORD:", error);
    }
    else {
        console.log("Email server is ready.");
    }
});
exports.default = transporter;
