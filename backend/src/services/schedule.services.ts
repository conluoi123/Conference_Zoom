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
