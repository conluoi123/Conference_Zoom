import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { socketService } from "@/services/socket";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useNotification } from "./NotificationContext";
export const SocketListener = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const {fetchNotification} = useNotification();
  useEffect(() => {
    //  Chỉ kết nối khi đã có user và không đang loading
    if (!isLoading && user?.email) {
      console.log("🔌 SocketListener: Kết nối socket cho", user.email);
      socketService.connect(user.email);

      //  Đăng ký listener cho meeting invitation
      const handleMeetingInvite = (data: { message: string; roomId: string }) => {
        console.log("🔔 [GUEST] Nhận được lời mời họp!", data);
        toast.info("Lời mời họp mới", {
          description: data.message,
          action: {
            label: "Tham gia",
            onClick: () => navigate(`/meeting/${data.roomId}`),
          },
        });
        // refresh notification 
        setTimeout(()=> fetchNotification(), 1000)
      };

      // Listen for schedule reminders
      const handleScheduleNotification = (message: string) => {
        console.log("🔔 Received schedule notification:", message);
        toast.info("Nhắc nhở lịch họp", {
          description: message,
        });

        // Refresh notifications to get the new notification from server
        setTimeout(() => fetchNotification(), 1000);
      };
      socketService.onScheduleNotification(handleScheduleNotification)
      socketService.onMeetingInviteNotification(handleMeetingInvite);

      // ✅ Cleanup khi unmount
      return () => {
        console.log("🧹 SocketListener: Cleanup notification listeners");
        socketService.offNotificationEvents();
      };
    }
  }, [user?.email, isLoading, navigate, fetchNotification]);

  return null;
};