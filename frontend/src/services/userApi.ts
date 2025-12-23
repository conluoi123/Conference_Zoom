const API_BASE_URL = import.meta.env.VITE_API_URL;
// const API_BASE_URL = "http://localhost:8080";
// // const API_BASE_URL = "https://israel-ramose-premeditatingly.ngrok-free.dev"

import api from "./service";

interface LoginData {
  email: string;
}
interface OtpData {
  email: string;
  otp: string;
}

export const logIn = {
  sendOtp: (LoginData: LoginData) => api.post("/auth/sendOTP", LoginData),
  verifyOtp: (otpData: OtpData) => api.post("/auth/verifyOTP", otpData),
  outsideLogin: (appName: string) => {
    window.location.href = `${API_BASE_URL}/auth/${appName}`;
  },
};
