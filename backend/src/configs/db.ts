import mongoose from "mongoose";
import { ENV } from "./env";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(ENV.DB_URL);
    //debug
    console.log("Connect to MongoDB: ", conn.connection.host);
  } catch (error) {
    console.error("Error in connecting to database: ", error);
    process.exit(1); // 0 -> success, 1 -> failed
  }
};
