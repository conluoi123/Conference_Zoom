import api from "./service";

/*
    Định nghĩa Interface để khớp với BE. 
 */
export interface INotification{
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

    getAllNotifications : async (email:string): Promise<INotification[]>  => {
        try{
            const response = await api.get<{notifications : INotification[]}>("/notifications", {
                params : {email} // gửi email vào JSON, nên thay đổi truyền vào query
            });
            return response.data.notifications; // nhận về mảng thông báo 
        } catch(err)
        {
            console.error("Lỗi lấy thông báo: ", err); 
            throw err;
        }
    },

    markAsRead: async (notificationId: string) : Promise<void>  => {
        try{
            await api.post("/notifications/mark-read", {notificationId});
        } catch(err){
            console.error("Lỗi đánh dấu đã đọc ", err);
            throw err;
        }
    }
}