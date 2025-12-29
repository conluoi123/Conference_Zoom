import Schedule from "../models/schedule.model";
async function createScheduleOnDb(
  hostId: string,
  roomId: string,
  title: string,
  startTime: Date,
  endTime: Date,
  duration: number
) {
  try {
    const schedule = await Schedule.create({
      hostId,
      roomId,
      title,
      startTime,
      endTime,
      duration,
    });
    await schedule.save();
    return schedule;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function updateScheduleOnDb(
  roomId: string,
  hostId: string,
  title: string,
  startTime: Date,
  endTime: Date,
  duration: number
) {
  const schedule = await Schedule.findOne({ roomId, hostId, startTime });
  if (!schedule) {
    return null;
  }
  const updatedSchedule = await Schedule.findByIdAndUpdate(
    schedule._id,
    { title, startTime, endTime, duration },
    { new: true }
  );
  return updatedSchedule;
}

export { createScheduleOnDb, updateScheduleOnDb };

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

const getScheduleInfo = async (scheduleId: string) => {
  const schedule = await Schedule.findById(scheduleId);
  if (!schedule) {
    throw new Error("Lịch hẹn đã bị hủy");
  }
  return schedule;
};

export { getScheduleInfo };
