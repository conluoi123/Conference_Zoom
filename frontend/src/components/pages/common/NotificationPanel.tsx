import { Bell, Clock, Users, Video, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNotification } from "@/context/NotificationContext";

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

  return date.toLocaleDateString("vi-VN");
};

// Get icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case "meeting":
      return <Video className="w-5 h-5 text-blue-600" />;
    case "invitation":
      return <Users className="w-5 h-5 text-green-600" />;
    case "schedule":
      return <Calendar className="w-5 h-5 text-orange-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-400" />;
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

export function NotificationPanel() {
  const { notifications, unreadCount, markAsRead } = useNotification();

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-96 mr-4" align="start">
        <DropdownMenuLabel className="px-4 py-3 font-normal">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-500">
                {unreadCount} thông báo chưa đọc
              </p>
            )}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="max-h-[450px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <Bell className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Không có thông báo mới</p>
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`px-4 py-3 cursor-pointer focus:bg-gray-50 ${!notification.isRead ? "bg-blue-50/50" : ""
                  }`}
                onClick={() => handleNotificationClick(notification._id, notification.isRead)}
              >
                <div className="flex gap-3 w-full">
                  <div className="shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {getNotificationTitle(notification.type)}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {notification.content}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatRelativeTime(notification.sentAt)}</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        {notifications.length > 0 && (
          <Link to="/notification">
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium h-9"
              >
                Xem tất cả thông báo
              </Button>
            </div>
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
