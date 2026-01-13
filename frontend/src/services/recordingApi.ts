import api from "./service";

export const recordingAPI = {
    /**
     * Get recording URLs for a specific session
     * Backend: GET /recordings/:roomId/:sessionId
     * Returns: string[] (array of recording URLs)
     */
    getSessionRecordings: async (roomId: string, sessionId: string): Promise<string[]> => {
        try {
            const response = await api.get(`/recordings/${roomId}/${sessionId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 403) {
                throw new Error("You don't have permission to view this recording");
            }
            if (error.response?.status === 404) {
                throw new Error("No recording found for this session");
            }
            console.error("Error fetching recordings:", error);
            throw new Error(error.response?.data?.message || "Failed to fetch recordings");
        }
    },
};
