"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});
transporter.verify((error, success) => {
    if (error) {
        console.error("Email config error. Check HOST, PORT, and APP PASSWORD:", error.message);
    }
    else {
        console.log("Email server is ready. Using host:", 465);
    }
});
exports.default = transporter;
