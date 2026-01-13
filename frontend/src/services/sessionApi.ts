import api from "./service";

export interface SessionHistory {
    roomId: string;
    sessionId: string;
    title?: string;
    start?: string;
    hasRecording?: boolean;
}

export const sessionAPI = {
    /**
     * Get user's meeting history
     * Backend: POST /:id/meeting-history (expects userId in body)
     */
    getUserHistory: async (userId: string): Promise<SessionHistory[]> => {
        try {
            const response = await api.post(`/${userId}/meeting-history`, { userId });
            return response.data;
        } catch (error: any) {
            console.error("Error fetching user history:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch history");
        }
    },
};
