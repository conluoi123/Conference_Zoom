import api from "./service";
interface ScheduleData {
  hostId: string;
  title: string;
  startTime: Date;
  duration: string;
  emails: string[];
}

export const scheduleApi = {
  createSchedule: async (request: ScheduleData) => {
    try {
      const { hostId, title, startTime, duration, emails } = request || {};
      console.log(hostId);
      const response = await api.post("/schedule/create", {
        hostId,
        title,
        startTime,
        duration,
        emails,
      });
      console.log(0)
      return response.data;
    } catch (error: any) {
      if (error.response) {
          if (error.response.status === 404) {
            console.log(1)
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }
        console.error("Lỗi BE:", error.response.data);
        throw new Error(error.response.data.message || "Tạo phòng thất bại");
      }

      console.error("Lỗi hệ thống:", error.message);
      throw error;
    }
  },
};
