import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "./AuthContext";
import { notificationService } from "@/services/notification";
import type { INotification } from "@/services/notification";

interface NotificationContextType {
  notifications: INotification[];
  unreadCount: number;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  currentFilter: string;
  fetchNotification: (page?: number, filter?: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  addNotification: (notification: INotification) => void;
  setPage: (page: number) => void;
  setFilter: (filter: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentFilter, setCurrentFilter] = useState<string>("all");
  const { user, isLoading: authLoading } = useAuth();

  const fetchNotification = useCallback(async (page: number = 1, filter: string = "all") => {
    if (!user?.email) {
      return;
    }
    setIsLoading(true);
    try {
      const data = await notificationService.getAllNotifications(user.email, page, 5, filter);
      console.log(data)
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setCurrentPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Lỗi trong việc fetch thông báo: ", err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    if (!authLoading && user?.email) {
      fetchNotification(currentPage, currentFilter);
    }
  }, [user?.email, authLoading, currentPage, currentFilter, fetchNotification]);

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Không thể đánh dấu đã đọc ", err);
    }
  };

  const addNotification = (notification: INotification) => {
    setNotifications((prev) => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  const setPage = (page: number) => {
    setCurrentPage(page);
  };

  const setFilter = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    currentPage,
    totalPages,
    currentFilter,
    fetchNotification,
    markAsRead,
    addNotification,
    setPage,
    setFilter,
  };
  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("lỗi");
  }
  return context;
};

export default NotificationProvider;
