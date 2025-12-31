import api from "./service";

/*
    Định nghĩa Interface để khớp với BE. 
 */
export interface INotification {
  _id: string;
  recipient: string;
  type: string;
  content: string;
  roomId?: string;
  isRead: boolean;
  sentAt: string; // API trả về string tự xử lí
}

export const notificationService = {
  /*
        Đây là các Arrowfunction async
    */

  getAllNotifications: async (
    email: string,
    page: number = 1,
    limit: number = 5,
    filter?: string
  ): Promise<{
    notifications: INotification[];
    total: number;
    unreadCount: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    try {
      const params: any = { email, page, limit };
      if (filter && filter !== 'all') {
        params.filter = filter;
      }
      const response = await api.get<{
        notifications: INotification[];
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
      }>("/notifications", {
        params,
      });
      return response.data; // nhận về mảng thông báo
    } catch (err) {
      console.error("Lỗi lấy thông báo: ", err);
      throw err;
    }
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    try {
      await api.post("/notifications/mark-read", { notificationId });
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc ", err);
      throw err;
    }
  },
};
