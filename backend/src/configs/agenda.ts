import Agenda from "agenda";
import { ENV } from "./env";
import { scheduleNotification } from "../socket/events/notification";

// 1. Khởi tạo và kết nối DB ngay lập tức
const agenda = new Agenda({
  db: {
    address: ENV.DB_URL,
    collection: "notifications",
  },
  processEvery: "1 minute",
});

scheduleNotification(agenda);

export const startAgenda = async () => {
  try {
    await agenda.start();
    console.log("Agenda Scheduler đã bắt đầu chạy!");
  } catch (error) {
    console.error("Lỗi khởi động Agenda:", error);
  }
};

export default agenda;
