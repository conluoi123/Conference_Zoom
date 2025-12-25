import { schedule } from "./../../../node_modules/agenda/lib/job/schedule";
import { processEvery } from "./../../../node_modules/agenda/lib/agenda/process-every";
import { ENV } from "../../configs/env";
import Agenda from "agenda";
import Notification from "../../models/notification.model";
import { Server, Socket } from "socket.io";

/*
    - Thông báo cho cuộc họp được mời đang diễn ra //socketIO
    - Thông báo lời mời cho lịch hẹn (nếu cả 2 cùng online lưu noti pending, bắn socket ), mời vào phòng (đồng ý hay không đồng ý thì bắn socket)
    - Thông báo bản ghi được chia sẻ (socket)
    - Thông báo cuộc họp đã kết thúc (socket)
    - Lên lịch tự động xóa notifications với những notification trong quá khứ (TTL của mongodb)
    - Thông báo trước khi diễn ra tầm 15p (agenda)
*/
/*
    - Khi lập lịch hẹn có mời -> tạo invitation ->lập lịch cho agenda khi invitation status = agree --> thêm vào invited trong roomId
        --> tạo notification --> schedule thông báo với thời gian trước 15p vào phòng
    -
 */
const scheduleNotification = (agenda: Agenda) => {
  agenda.database(ENV.DB_URL, "notifications");
  agenda.define("onScheduleNotification", async (job) => {});
};

const notificationSocketHandler = (io: Server, socket: Socket) => {
  socket.on("notification:create", ({ email, content, type }) => {});
};
