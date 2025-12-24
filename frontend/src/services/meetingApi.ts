interface MeetingData {
  peerId?: string;
  title?: string;
  meetingType?: "instant" | "scheduled";
  startTime?: string;
}

interface JoinMeetingData {
  roomId: string;
  peerId?: string;
}

import api from "./service";

export const meetingAPI = {
  createMeeting: async (meetingData?: MeetingData) => {
    try {
      const { peerId, title, meetingType, startTime } = meetingData || {};

      const requestBody = {
        peerId,
        title: title || "Cuộc họp mới",
        meetingType: meetingType || "instant",
        ...(meetingType === "scheduled" && startTime ? { startTime } : {}),
      };

      const response = await api.post("/rooms/create", requestBody);

      const { roomId, token, hostId } = response.data;

      return { roomId, token, hostId };
    } catch (error: any) {
      if (error.response) {
        console.error("Lỗi BE:", error.response.data);
        throw new Error(error.response.data.message || "Tạo phòng thất bại");
      }

      console.error("Lỗi hệ thống:", error.message);
      throw error;
    }
  },

  joinMeeting: async (joinData: JoinMeetingData) => {
    try {
      const { roomId, peerId } = joinData;

      const requestBody = {
        peerId,
        roomId,
      };

      const response = await api.post(`/rooms/${roomId}/join`, requestBody);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Không tìm thấy phòng họp",
          };
        }

        throw new Error(
          error.response.data?.message || "Tham gia phòng họp thất bại"
        );
      }

      throw new Error("Không thể kết nối đến server");
    }
},
};

export default {
  meeting: meetingAPI,
};

export type { MeetingData, JoinMeetingData };
