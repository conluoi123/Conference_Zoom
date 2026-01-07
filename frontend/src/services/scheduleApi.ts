import { success } from "zod";
import api from "./service";
interface ScheduleData {
  hostId: string;
  roomId: string;
  title: string;
  startTime: Date;
  duration: string;
  emails: string[];
}

interface RoomRequest {
  hostId: string;
  roomId: string;
}

export const scheduleApi = {
  createSchedule: async (request: ScheduleData) => {
    try {
      const { hostId, roomId, title, startTime, duration, emails } =
        request || {};
      console.log(hostId);
      const response = await api.post("/schedule/create", {
        hostId,
        roomId,
        title,
        startTime,
        duration,
        emails,
      });
      console.log(0);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          console.log(1);
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
  getInvitedUserInRoom: async (request: RoomRequest) => {
    try {
      const { hostId, roomId } = request || {};
      const response = await api.post("rooms/schedule/invited-users", {
        hostId,
        roomId,
      });
      return { response: response.data?.invitedUsers, success: true }; 
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Phòng họp không tồn tại",
          };
        }
        console.error("Lỗi BE:", error.response.data);
        throw new Error(
          error.response.data.message || "Lấy danh sách khách mời thất bại"
        );
      }

      console.error("Lỗi hệ thống:", error.message);
      throw error;
    }
  },
  getUpcomingSchedule: async ({ userId }: { userId: string }) => {
    try {
      const response = await api.get("/schedule/upcoming", {
        params: { userId },
      });

      return response.data?.schedules ?? [];
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Lấy danh sách lịch họp thất bại"
        );
      }
      throw error;
    }
  },
  getListSchedule: async ({ userId }: { userId: string }) => {
    try {
      const response = await api.get("/schedule/listSchedule", {
        params: { userId },
      });

      return response.data?.schedules ?? [];
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Lấy danh sách lịch họp thất bại"
        );
      }
      throw error;
    }
  },
  getListScheduleByHostId: async ({ userId }: { userId: string }) => {
    try {
      const response = await api.get("/schedule/getListByHostId", {
        params: { userId },
      });

      return response.data?.listSchedule ?? [];
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Lấy danh sách lịch họp thất bại"
        );
      }
      throw error;
    }
  },
  updateSchedule: async (data: {
    scheduleId: string;
    title?: string;
    startTime?: Date;
    endTime?: Date;
    duration?: string;
    emails?: string[];
  }) => {
    try {
      const response = await api.patch("/schedule/updated", data);
      return response.data.schedule;
    } catch (error: any) {
      if (error.response) {
        throw new Error(
          error.response.data?.message || "Cập nhật lịch họp thất bại"
        );
      }
      throw error;
    }
  },
};
