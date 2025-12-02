import type { JoinMeetingData, MeetingData } from "../App";

// const API_BASE_URL = "https://biserial-subattenuate-arie.ngrok-free.dev";
const API_BASE_URL = "http://localhost:8080";
// const API_BASE_URL = "https://israel-ramose-premeditatingly.ngrok-free.dev";

export const meetingAPI = {
  createMeeting: async (meetingData?: MeetingData) => {
    try {
      const { peerId, title, meetingType, startTime } = meetingData || {};

      const requestBody = {
        peerId: peerId,
        title: title || "Cuộc họp mới",
        meetingType: meetingType || "instant", // 'instant' or 'scheduled'
        ...(meetingType === "scheduled" && startTime
          ? { startTime: startTime }
          : {}),
      };

      const response = await fetch(`${API_BASE_URL}/rooms/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      const { roomId, token } = result;

      // Response từ backend: { success: true, data: { roomId, token, meeting } }
      return { roomId, token };
    } catch (error) {
      if (error instanceof Error) {
        // Lúc này TypeScript đã biết đây là Error, bạn có thể gọi .message
        console.error("Lỗi:", error.message);
        throw error;
      } else {
        console.error("Lỗi lạ:", error);
        throw new Error("Đã xảy ra lỗi không xác định khi tạo phòng họp");
      }
    }
  },

  joinMeeting: async (joinData: JoinMeetingData) => {
    try {
      const { roomId, peerId } = joinData;

      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") || ""}`,
        },
        body: JSON.stringify({
          roomId,
          peerId: peerId,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: "Không tìm thấy phòng họp",
          };
        }
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`
        );
      }

      const result = await response.json();

      return result;
      // Tại dòng 56 (trong block catch)
    } catch (error) {
      if (error instanceof Error) {
        // Lúc này TypeScript đã biết đây là Error, bạn có thể gọi .message
        console.error("Lỗi:", error.message);
        throw error;
      } else {
        console.error("Lỗi lạ:", error);
        throw new Error("Đã xảy ra lỗi không xác định khi tham gia phòng họp");
      }
    }
  },
};

// Export all APIs
export default {
  meeting: meetingAPI,
};

export type { MeetingData, JoinMeetingData };
