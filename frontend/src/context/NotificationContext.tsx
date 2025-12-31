import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "@/services/notification";
import type { INotification } from "@/services/notification";
import { toast } from "sonner";

interface NotificationContextType {
  /*
        Mảng thông báo 
        fetchNotification: ko nhận tham số, sd lời hứa, ko trả về kết quả chỉ báo khi nào xong rồi 
        markAsRead: nhận tham số id, sd lời hứa, ko trả về kết quả chỉ báo khi nào xong 
        vì làm việc với bất đồng bộ, nên phải có một promise để mấy thằng sau chờ nó
        addNotification: nhận vào một thông báo mới, gọi API để lưu thông báo đó trên db, ko caanf trả về

    
    */
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotification: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: INotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/*
    Truyền vào children để Provider có thể truyền bọc tất cả component trong nó và nó các component con có thể sử dụng context 

*/
function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user, isLoading: authLoading } = useAuth();

  /*
        fetch thông báo nên sử dụng callback để tránh việc useEffect gọi đi gọi lại các hàm mới gây loop vô hạn
    */
  const fetchNotification = useCallback(async () => {
    if (!user?.email) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await notificationService.getAllNotifications(user.email);
      setNotifications(data);
    } catch (err) {
      console.error("Lỗi trong việc fetch thông báo: ", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  /*
        Sử dụng useEffect để làm việc với API
        truyền fetchNotification vào [] là để chỉ chạy lại effect khi mà reference của fetch thay đổi 
        đồng thời đảm bảo đang sử dụng version mới nhất lấy từ API 

   */
  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchNotification();
    }
  }, [user?.email, authLoading, fetchNotification]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Không thể đánh dấu đã đọc ", err);
    }
  };

  const addNotification = (notification: INotification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  // lấy số thông báo chưa đọc
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // gom thành 1 object để truyền cho children dùng
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotification,
    markAsRead,
    addNotification,
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
    const context = useContext(NotificationContext); 
    if (context === undefined){
        throw new Error ("lỗi");
    }
    return context;
};

export default NotificationProvider;
