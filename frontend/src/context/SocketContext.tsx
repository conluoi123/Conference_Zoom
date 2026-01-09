import { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useNotifications } from "./NotificationContext";
import { socketService } from "@/services/socket";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const SocketListener = () => {
  const { user, isLoading } = useAuth();
  const { fetchNotifications } = useNotifications();
  const navigate = useNavigate();
  const extractRoomId = (type: string): string | null => {
    const parts = type.split("-");
    if (parts.length >= 2 && parts[0] === "meeting") {
      return parts.slice(1).join("-"); // Handle roomId with dashes
    }
    return null;
  };
  useEffect(() => {
    //  Chỉ kết nối khi đã có user và không đang loading
    if (!isLoading && user?.email) {
      console.log("🔌 SocketListener: Kết nối socket cho", user.email);
      socketService.connect(user.email);
      
      //  Đăng ký listener cho meeting invitation
      const handleMeetingInvite = (data: {
        type: string;
        content: string;
        isRead: boolean;
        sentAt: Date;
      }) => {
        console.log("🔔 [GUEST] Nhận được lời mời họp!", data);
        const handleJoin = async () => {
          if (!user?.id) {
            toast.error("Vui lòng đăng nhập để tham gia");
            return;
          }

          try {
            // Import meetingAPI at top of file
            const { meetingAPI } = await import("@/services/meetingApi");
            const roomId = extractRoomId(data.type) || "";
            // console.log(data.type.split("-"));
            const room = await meetingAPI.joinMeeting({
              roomId,
              peerId: user.id,
            });

            if (!room || !room.token) {
              toast.error("Không thể tham gia phòng họp");
              return;
            }

            navigate(`/meeting/${roomId}`, {
              state: {
                token: room.token,
                roomId,
                hostId: room.hostId,
                displayName: user.displayName || "Guest",
                settings: room.settings || {
                  allowJoin: true,
                  allowShareScreen: true,
                  allowChat: true,
                  allowMic: true,
                  allowCam: true,
                },
              },
            });
          } catch (error: any) {
            console.error("Join meeting error:", error);
            toast.error("Không thể tham gia phòng họp");
          }
        };
        toast.info("Lời mời họp mới", {
          description:
            data.content +
            ".\nGửi vào lúc: " +
            new Date(data.sentAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
            }),
          action: {
            label: "Tham gia",
            onClick: handleJoin,
          },
          cancel: {
            label: "Đóng",
            onClick: () => {},
          },
          duration: 10000,
        });

        // Refresh notifications to get the new notification from server
        setTimeout(() => fetchNotifications(), 1000);
      };

      // Listen for schedule reminders
      const handleScheduleNotification = (data: {
        type: string;
        content: string;
        isRead: boolean;
        sentAt: Date;
      }) => {
        console.log("🔔 Received schedule notification:", data.content);
        toast.info("Nhắc nhở lịch họp", {
          description:
            data.content +
            ".\nGửi vào lúc: " +
            new Date(data.sentAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
            }),
          cancel: {
            label: "Đóng",
            onClick: () => {},
          },
          duration: 8000,
        });

        // Refresh notifications to get the new notification from server
        setTimeout(() => fetchNotifications(), 1000);
      };

      // Listen for recording shared notifications
      const handleRecordingShared = (data: {
        type: string;
        content: string;
        isRead: boolean;
        sentAt: string;
      }) => {
        console.log("📹 Recording shared notification:", data);

        // Parse roomId from content: "Bạn được chia sẻ bản ghi cho cuộc họp:ROOM_ID"
        const roomIdMatch = data.content.match(/cuộc họp:(.+)$/);
        const roomId = roomIdMatch ? roomIdMatch[1].trim() : "";

        // Parse sessionId from type: "recording-SESSION_ID"
        const sessionId = data.type.replace("recording-", "");
        toast.info("Bản ghi mới được chia sẻ", {
          description: data.content,
          action: {
            label: "Xem ngay",
            onClick: () => {
              if (sessionId && roomId) {
                navigate(`/recordings/${sessionId}`, {
                  state: { roomId }
                });
              } else {
                console.error("Missing sessionId or roomId:", { sessionId, roomId });
              }
            },
          },
          cancel: {
            label: "Đóng",
            onClick: () => {},
          },
          duration: 10000,
        });

        // Refresh notifications
        setTimeout(() => fetchNotifications(), 1000);
      };

      const handleScheduleInvitedNotification = (data: {
        type: string;
        content: string;
        isRead: boolean;
        sentAt: Date;
      }) => {
        toast.info("Lời mời lịch họp", {
          description:
            data.content +
            ".\nGửi vào lúc: " +
            new Date(data.sentAt).toLocaleString("vi-VN", {
              timeZone: "Asia/Ho_Chi_Minh",
              hour12: false,
            }),
          action: {
            label: "Xem",
            onClick: () => navigate(`/notification`),
          },
          closeButton: true,
          duration: 8000,
        });

        // Refresh notifications to get the new notification from server
        setTimeout(() => fetchNotifications(), 1000);
      };

      socketService.onMeetingInviteNotification(handleMeetingInvite);
      socketService.onScheduleNotification(handleScheduleNotification);
      socketService.onRecordingShared(handleRecordingShared);
      socketService.onScheduleInviteNotification(
        handleScheduleInvitedNotification
      );

      // ✅ Cleanup khi unmount
      return () => {
        console.log("🧹 SocketListener: Cleanup notification listeners");
        socketService.offNotificationEvents();
      };
    }
  }, [user?.email, isLoading, navigate, fetchNotifications]);

  return null;
};
