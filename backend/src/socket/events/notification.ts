import Agenda from "agenda";
import { Server, Socket } from "socket.io";
import { updateInvitationStatus } from "../../services/invitation.services";
import { updateRoomOnDatabase } from "../../services/room.services";
import { getScheduleInfo } from "../../services/schedule.services";
import { createNotification } from "../../services/notification.services";
import { getIO } from "../socketHandler";

/*
    - Thông báo lời mời cho lịch hẹn (nếu cả 2 cùng online lưu noti pending, bắn socket ), mời vào phòng (đồng ý hay không đồng ý thì bắn socket)
    - Thông báo bản ghi được chia sẻ (socket)
    - Lên lịch tự động xóa notifications với những notification trong quá khứ (TTL của mongodb)
    - Thông báo trước khi diễn ra tầm 15p (agenda)
*/
/* Xem trong schedule controller (createSchedule)
  Thông báo có cuộc hẹn sắp đến
    - Khi lập lịch hẹn có mời -> tạo invitation, thông báo invitation -> lập lịch cho agenda khi invitation status = agree --> thêm vào invited trong roomId
        --> tạo notification --> schedule thông báo với thời gian trước 15p vào phòng
 */

/* Xem trong meeting.ts (sự kiện meeting:invite)
   Thông báo khi được mời vào phòng họp đang diễn ra
   - Khi được mời socket gửi sự kiện meeting:invite kèm roomId, hostId (participantId của host), danh sách các email của người được mời
    --> Thêm người được mời vào danh sách invited trong session hiện tại --> tạo 1 thông báo lưu trữ --> gửi socket notification:meeting thông báo cho người được mời
   Trường hợp người được mời chưa onl thì vẫn có notification lưu và gửi lại khi người dùng đăng nhập 
*/

/* Xem tại đây
  Thông báo lời mời tham gia
   - Khi lập lịch hẹn có mời -> tạo socket tạo notification:invitation và gửi chọn yes/no --> socket nhận lựa chọn -> lập lịch cho agenda khi invitation status = agree -->
*/
const scheduleNotification = (agenda: Agenda) => {
  agenda.define("onScheduleNotification", async (job) => {
    const { schedule, email } = job.attrs.data;

    const timeString = new Date(schedule.startTime);
    const message = `Nhắc nhở: Bạn có lịch họp "${schedule.title}" vào lúc ${timeString}.`;

    try {
      await createNotification(email, "schedule", message);
      const io = getIO();
      io.to(email).emit("notification:schedule", message);
    } catch (err) {
      console.error("Lỗi tạo notification:", err);
    }
  });
};

const notificationSocketHandler = (
  io: Server,
  socket: Socket,
  agenda: Agenda
) => {
  socket.on("notification:invitation", async ({scheduleId, email, status}) => {
    try {
      const schedule = await getScheduleInfo(scheduleId);
      if (!updateInvitationStatus(scheduleId, email, status)) {
        throw new Error("Lời mời đã hết hạn");
      };
      if (status == "accepted") {
        await updateRoomOnDatabase(schedule.roomId, schedule.hostId, null, null, [
          email,
        ]);
        const trigger = new Date(schedule.startTime);
        trigger.setMinutes(trigger.getMinutes() - 15);
        const uniqueJobId = `schedule_noti_${scheduleId}_${email}`;

        await agenda.cancel({
          name: "onScheduleNotification",
          "data.uniqueJobId": uniqueJobId,
        });

        await agenda.schedule(trigger, "onScheduleNotification", {
          schedule,
          email,
          uniqueJobId,
        });
      }
    } catch (error) {
      io.to(email).emit("notification:invitation-error", error);
    }
  });
};

export { notificationSocketHandler, scheduleNotification };
