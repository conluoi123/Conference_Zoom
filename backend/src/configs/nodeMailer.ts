import { ENV } from "../configs/env";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: ENV.EMAIL_USER,
    pass: ENV.EMAIL_PASS,
  },
  family: 4,
});
transporter.verify((error, success) => {
  if (error) {
    console.error(
      "Email config error. Check HOST, PORT, and APP PASSWORD:",
      error.message
    );
  } else {
    console.log("Email server is ready. Using host:", 465);
  }
});
export default transporter;
