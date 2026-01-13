import api from "./service";

/*
    Định nghĩa Interface để khớp với BE. 
 */
export interface INotification {
    _id: string;
    recipient: string;
    type: string;
    content: string;
    roomId?: string; // Optional roomId for meeting/invitation notifications
    isRead: boolean;
    sentAt: string; // API trả về string tự xử lí 
}

export const notificationService = {
    getAllNotifications: async (userId: string, email: string): Promise<INotification[]> => {
        try {
            const response = await api.get<{ notifications: INotification[] }>(`/${userId}/notifications`, {
                params: { email } // Email as query param
            });
            return response.data.notifications;
        } catch (err) {
            console.error("Lỗi lấy thông báo: ", err);
            throw err;
        }
    },

    markAsRead: async (notificationId: string): Promise<void> => {
        try {
            await api.post("/notifications/mark-read", { notificationId });
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc: ", err);
            throw err;
        }
    },

    getStatusToNotify: async (notificationId: string): Promise<string> => {
        try {
            const response = await api.post("/notifications/statusInvitation", { notificationId });
            return response.data.status
        } catch (err) {
            console.error("Lỗi đánh dấu đã đọc: ", err);
            throw err;
        }
    }
};