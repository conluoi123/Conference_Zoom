import api from "./service";

export interface Recording {
    sessionId: string;
    roomId: string;
    hostId: string;
    fileUrl: string;
    createdAt: Date;
    shared: string[];
}

export const recordingAPI = {
    // Lấy tất cả recordings của user
    getRecordings: async () => {
        try {
            const response = await api.get("/rooms/recordings");
            return response.data.recordings;
        } catch (error: any) {
            console.error("getRecordings error:", error);
            throw new Error(error.response?.data?.error || "Không thể lấy danh sách recordings");
        }
    },

    // Lấy chi tiết recording (fileUrl)
    getRecordingDetail: async (sessionId: string, roomId: string) => {
        try {
            const response = await api.get(`/rooms/${roomId}/recordings/${sessionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("Bạn không có quyền xem bản ghi này");
            }
            console.error("getRecordingDetail error:", error);
            throw new Error(error.response?.data?.error || "Không thể lấy thông tin recording");
        }
    },

    // Chia sẻ recording với emails
    shareRecording: async (sessionId: string, emails: string[]) => {
        try {
            const response = await api.post(`/rooms/recordings/${sessionId}/share`, {
                emails,
            });
            return response.data;
        } catch (error: any) {
            console.error("shareRecording error:", error);
            throw new Error(error.response?.data?.error || "Không thể chia sẻ recording");
        }
    },

    // Xóa recording
    deleteRecording: async (sessionId: string) => {
        try {
            const response = await api.delete(`/rooms/recordings/${sessionId}`);
            return response.data;
        } catch (error: any) {
            console.error("deleteRecording error:", error);
            throw new Error(error.response?.data?.error || "Không thể xóa recording");
        }
    },
};

export default recordingAPI;
