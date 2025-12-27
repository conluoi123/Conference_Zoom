import api from "./service";

/*
    Định nghĩa Interface để khớp với BE. 
 */
export interface INotification{
    _id: string; 
    recipient: string; 
    type: string; 
    content: string; 
    isRead: boolean; 
    sentAt: string; // API trả về string tự xử lí 
}

export const notificationService = {
    getAllNotifications : async (email:string) => {
        try{
            const response = await api.get<{notifications : INotification}>("/notifications", {
                data : {email} // gửi email vào JSON, nên thay đổi truyền vào query
            });
            return response.data.notifications; // nhận về mảng thông báo 
        } catch(err)
        {
            console.error("Lỗi lấy thông báo: ", err); 
            throw err;
        }
    }
}