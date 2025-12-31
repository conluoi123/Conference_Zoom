import { useState } from "react";
import { Bell, ChevronLeft, Video, Users, Calendar, CheckCheck, X } from "lucide-react";
import { MainLayout } from "@/layout/MainLayout";
import { Link, useNavigate } from "react-router-dom";
import { useNotification  } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { meetingAPI } from "@/services/meetingApi";

// Helper function to format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return "Vừa xong";
  if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
  if (diffInHours < 24) return `${diffInHours} giờ trước`;
  if (diffInDays < 7) return `${diffInDays} ngày trước`;

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return <Video className="w-6 h-6 text-blue-600" />;
    case "invitation":
      return <Users className="w-6 h-6 text-green-600" />;
    case "schedule":
      return <Calendar className="w-6 h-6 text-orange-600" />;
    default:
      return <Bell className="w-6 h-6 text-gray-400" />;
  }
};

// Get title based on notification type
const getNotificationTitle = (type: string) => {
  switch (type) {
    case "meeting":
      return "Lời mời họp";
    case "invitation":
      return "Lời mời tham gia lịch";
    case "schedule":
      return "Nhắc nhở lịch họp";
    default:
      return "Thông báo";
  }
};

function NotificationPage() {
  const { notifications, markAsRead, isLoading } = useNotification();
  const { user } = useAuth();
  const [filter, setFilter] = useState<string>("all");
  const [joiningMeetingId, setJoiningMeetingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.isRead;
    return notif.type === filter;
  });

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    for (const notif of unreadNotifications) {
      await markAsRead(notif._id);
    }
  };

  const handleJoinMeeting = async (e: React.MouseEvent, roomId: string, notificationId: string) => {
    e.stopPropagation();

    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để tham gia cuộc họp");
      return;
    }

    setJoiningMeetingId(notificationId);

    try {
      // Call API to get token
      const room = await meetingAPI.joinMeeting({
        roomId: roomId,
        peerId: user.id,
      });

      if (!room || !room.token) {
        toast.error("Không thể tham gia phòng họp");
        return;
      }

      // Mark notification as read
      await markAsRead(notificationId);

      // Navigate to meeting with token
      navigate(`/meeting/${roomId}`, {
        state: {
          token: room.token,
          roomId: roomId,
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

      if (error.message?.includes("Không tìm thấy phòng họp")) {
        toast.error("Phòng họp không tồn tại hoặc đã kết thúc");
      } else if (error.message?.includes("Chưa đến thời gian")) {
        toast.error("Chưa đến thời gian vào phòng họp");
      } else {
        toast.error("Không thể tham gia phòng họp. Vui lòng thử lại.");
      }
    } finally {
      setJoiningMeetingId(null);
    }
  };

  const handleDeclineMeeting = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    await markAsRead(notificationId);
    toast.success("Đã từ chối lời mời");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-12">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-4">
            <Link
              to="/home"
              className="flex items-center gap-4 text-blue-600 font-medium hover:text-blue-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
              <p className="text-xl">Quay lại trang chủ</p>
            </Link>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
                <p className="text-gray-600 mt-1">
                  {notifications.filter((n) => !n.isRead).length} thông báo chưa đọc
                </p>
              </div>
              {notifications.some((n) => !n.isRead) && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  className="gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              {[
                { value: "all", label: "Tất cả" },
                { value: "unread", label: "Chưa đọc" },
                { value: "meeting", label: "Họp" },
                { value: "invitation", label: "Lời mời" },
                { value: "schedule", label: "Lịch hẹn" },
              ].map((filterOption) => (
                <Button
                  key={filterOption.value}
                  variant={filter === filterOption.value ? "default" : "outline"}
                  onClick={() => setFilter(filterOption.value)}
                  className="min-w-[100px]"
                >
                  {filterOption.label}
                </Button>
              ))}
            </div>

            {/* Main content */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <Bell className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Không có thông báo
                  </h3>
                  <p className="text-sm text-gray-500">
                    {filter === "all"
                      ? "Bạn chưa có thông báo nào"
                      : filter === "unread"
                        ? "Bạn đã đọc hết thông báo"
                        : `Không có thông báo loại ${getNotificationTitle(filter)}`}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={`p-6 hover:bg-gray-50 transition-colors ${!notification.isRead ? "bg-blue-50/30" : ""
                        }`}
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getNotificationTitle(notification.type)}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {formatRelativeTime(notification.sentAt)}
                              </p>
                            </div>
                            {!notification.isRead && (
                              <div className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                                <span className="text-sm font-medium text-blue-600">
                                  Mới
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-700 leading-relaxed mb-3">
                            {notification.content}
                          </p>

                          {/* Action buttons for meeting invitations */}
                          {notification.type === "meeting" && notification.roomId && (
                            <div className="flex gap-3 mt-4">
                              <Button
                                onClick={(e) => handleJoinMeeting(e, notification.roomId!, notification._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                size="sm"
                                disabled={joiningMeetingId === notification._id}
                              >
                                {joiningMeetingId === notification._id ? (
                                  <>
                                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Đang tham gia...
                                  </>
                                ) : (
                                  <>
                                    <Video className="w-4 h-4 mr-2" />
                                    Tham gia
                                  </>
                                )}
                              </Button>
                              <Button
                                onClick={(e) => handleDeclineMeeting(e, notification._id)}
                                variant="outline"
                                className="border-gray-300 hover:bg-gray-100"
                                size="sm"
                                disabled={joiningMeetingId === notification._id}
                              >
                                <X className="w-4 h-4 mr-2" />
                                Từ chối
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default NotificationPage;

