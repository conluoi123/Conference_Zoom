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
    notifications: INotification[];
    unreadCount: number;
    isLoading: boolean;
    fetchNotifications: () => Promise<void>;
    markAsRead: (notificationId: string) => Promise<void>;
    addNotification: (notification: INotification) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
    undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { user, isLoading: authLoading } = useAuth();
    // Define fetchNotifications first before using it in useEffect
    const fetchNotifications = useCallback(async () => {
        if (!user?.email || !user?.id) {
            console.log("⚠️ Cannot fetch notifications: missing user data", { email: user?.email, id: user?.id });
            return;
        }

        console.log("📡 Fetching notifications for:", { userId: user.id, email: user.email });
        setIsLoading(true);
        try {
            const data = await notificationService.getAllNotifications(user.id, user.email);
            console.log("✅ Notifications fetched:", data);
            setNotifications(data);
        } catch (error: any) {
            console.error("❌ Failed to fetch notifications:", error);
            console.error("Error details:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error("Không thể tải thông báo");
        } finally {
            setIsLoading(false);
        }
    }, [user?.email, user?.id]);

    // Fetch notifications when user is available
    useEffect(() => {
        if (!authLoading && user?.email && user?.id) {
            fetchNotifications();
        }
    }, [user?.email, user?.id, authLoading, fetchNotifications]);

    // Poll for new notifications periodically (every 30 seconds)
    // Socket events are handled by SocketListener component
    useEffect(() => {
        if (!user?.email || !user?.id) return;

        const pollInterval = setInterval(() => {
            fetchNotifications();
        }, 30000); // Poll every 30 seconds

        return () => {
            clearInterval(pollInterval);
        };
    }, [user?.email, user?.id, fetchNotifications]);

    const markAsRead = async (notificationId: string) => {
        try {
            await notificationService.markAsRead(notificationId);

            // Update local state
            setNotifications((prev) =>
                prev.map((notif) =>
                    notif._id === notificationId ? { ...notif, isRead: true } : notif
                )
            );
        } catch (error) {
            console.error("Failed to mark notification as read:", error);
            toast.error("Không thể đánh dấu đã đọc");
        }
    };

    const addNotification = (notification: INotification) => {
        toast("Có thông báo mới");
        setNotifications((prev) => [notification, ...prev]);
    };

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const value: NotificationContextType = {
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        addNotification,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
