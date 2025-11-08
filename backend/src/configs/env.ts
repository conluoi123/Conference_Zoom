import dotenv from "dotenv";

dotenv.config();

const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV,
};

export { ENV };
