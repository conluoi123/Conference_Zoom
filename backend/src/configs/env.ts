import dotenv from "dotenv";

dotenv.config();

const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV,
  VIDEOSDK_API_ENDPOINT: process.env.VIDEOSDK_API_ENDPOINT,
  VIDEOSDK_API_KEY: process.env.VIDEOSDK_API_KEY,
  VIDEOSDK_SECRET_KEY: process.env.VIDEOSDK_SECRET_KEY,
};

export { ENV };
