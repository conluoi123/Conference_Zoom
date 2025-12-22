import Schedule, { ISchedule } from "../models/schedule.model";

//Vì 1 phòng họp sẽ có thể có nhiều lịch hẹn nhưng chỉ có thể có 1 hẹn sắp hoặc đang diễn ra (chưa kết thúc)
const latestSchedule = (roomId: string) => {
  const schedule = Schedule.find({ roomId: roomId, endTime: null });
  if (!schedule) {
    throw new Error("Lỗi database: Không tìm thấy lịch hẹn");
  }
  return schedule;
};

const isDueSchedule = (schedule: any) => {
  const now = Date.now();
  const due = new Date(schedule.startTime).getTime();
  if (due < now) {
    return true;
  }
  return false;
};

export { latestSchedule, isDueSchedule };
