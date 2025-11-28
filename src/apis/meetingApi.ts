const API_BASE_URL = "https://biserial-subattenuate-arie.ngrok-free.dev";

// Định nghĩa kiểu dữ liệu cho thông tin cuộc họp
interface MeetingData {
  peerId: string;
  title: string;
  meetingType: string;
  startTime: Date; // Hoặc Date tùy backend
}

// Định nghĩa kiểu dữ liệu cho hàm join (Sửa lỗi dòng 60)
interface JoinMeetingData {
  roomId: string;
  peerId: string;
  // Thêm các trường khác nếu có
}

export const meetingAPI = {
  createMeeting: async (meetingData: MeetingData) => {
    try {
      const { peerId, title, meetingType, startTime } = meetingData;

      const requestBody = {
        peerId: peerId, // Default to 'abc' if not provided, or handle as needed
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
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
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

      // Response từ backend: { success: true, data: { roomId, token, meeting } }
      return result;
    } catch (error) {
      if (error instanceof Error) {
        // Lúc này TypeScript đã biết đây là Error, bạn có thể gọi .message
        console.error("Lỗi:", error.message);
        throw error;
      } else {
        console.error("Lỗi lạ:", error);
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
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          roomId,
          peerId: peerId || "abc",
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

      // Handle different response formats
      const contentType = response.headers.get("content-type");
      let token;

      if (contentType && contentType.indexOf("application/json") !== -1) {
        const result = await response.json();
        // Case 1: { success: true, data: { token } }
        if (result.success && result.data?.token) {
          token = result.data.token;
        }
        // Case 2: { token: "..." }
        else if (result.token) {
          token = result.token;
        }
        // Case 3: Just the token string in JSON
        else if (typeof result === "string") {
          token = result;
        }
      } else {
        // Case 4: Plain text token
        token = await response.text();
      }

      if (token) {
        return {
          success: true,
          data: { token },
        };
      } else {
        throw new Error("Không nhận được token từ backend");
      }
      // Tại dòng 56 (trong block catch)
    } catch (error) {
      if (error instanceof Error) {
        // Lúc này TypeScript đã biết đây là Error, bạn có thể gọi .message
        console.error("Lỗi:", error.message);
        throw error;
      } else {
        console.error("Lỗi lạ:", error);
      }
    }
  },
};

// Export all APIs
export default {
  meeting: meetingAPI,
};
