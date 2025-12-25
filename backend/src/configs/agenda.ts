import Agenda from "agenda";
import { ENV } from "./env";

// 1. Khởi tạo và kết nối DB ngay lập tức
const agenda = new Agenda({
  db: {
    address: ENV.DB_URL,
    collection: "notifications",
  },
  processEvery: "1 minute",
});

export default agenda;
