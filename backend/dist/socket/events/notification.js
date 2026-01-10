"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleNotification = exports.notificationSocketHandler = void 0;
const invitation_services_1 = require("../../services/invitation.services");
const room_services_1 = require("../../services/room.services");
const schedule_services_1 = require("../../services/schedule.services");
const notification_services_1 = require("../../services/notification.services");
const socketHandler_1 = require("../socketHandler");
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
const scheduleNotification = (agenda) => {
    agenda.define("onScheduleNotification", (job) => __awaiter(void 0, void 0, void 0, function* () {
        const { schedule, email } = job.attrs.data;
        const timeString = new Date(schedule.startTime);
        const message = `Nhắc nhở: Bạn có lịch họp "${schedule.title}" vào lúc ${timeString}.`;
        try {
            const notification = yield (0, notification_services_1.createNotification)(email, `schedule-${schedule._id}`, message);
            const { type, content, isRead, sentAt } = notification;
            const io = (0, socketHandler_1.getIO)();
            io.to(email).emit("notification:schedule", {
                type,
                content,
                isRead,
                sentAt,
            });
        }
        catch (err) {
            console.error("Lỗi tạo notification:", err);
        }
    }));
};
exports.scheduleNotification = scheduleNotification;
const notificationSocketHandler = (io, socket, agenda) => {
    socket.on("notification:invitation", (_a) => __awaiter(void 0, [_a], void 0, function* ({ invitationId, email, status }) {
        try {
            const scheduleId = yield (0, invitation_services_1.getScheduleIdByInvitationId)(invitationId);
            const schedule = yield (0, schedule_services_1.getScheduleInfo)(scheduleId);
            if (!(0, invitation_services_1.updateInvitationStatus)(scheduleId, email, status)) {
                throw new Error("Lời mời đã hết hạn");
            }
            if (status == "accepted") {
                yield (0, room_services_1.updateRoomOnDatabase)(schedule.roomId, schedule.hostId, null, null, [email]);
                const trigger = new Date(schedule.startTime);
                trigger.setMinutes(trigger.getMinutes() - 15);
                const uniqueJobId = `schedule_noti_${scheduleId}_${email}`;
                yield agenda.cancel({
                    name: "onScheduleNotification",
                    "data.uniqueJobId": uniqueJobId,
                });
                yield agenda.schedule(trigger, "onScheduleNotification", {
                    schedule,
                    email,
                    uniqueJobId,
                });
            }
        }
        catch (error) {
            io.to(email).emit("notification:invitation-error", error);
        }
    }));
};
exports.notificationSocketHandler = notificationSocketHandler;
