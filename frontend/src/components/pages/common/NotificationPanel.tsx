import React from 'react';
import { Bell, Check, Clock, Users, Video } from 'lucide-react';
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Notification {
  id: string;
  type: 'meeting' | 'message' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon?: React.ReactNode;
}

export function NotificationPanel() {
  // Demo notifications (Giữ nguyên dữ liệu của bạn)
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'meeting',
      title: 'Cuộc họp sắp bắt đầu',
      message: 'Team Standup sẽ bắt đầu trong 5 phút',
      time: '5 phút trước',
      isRead: false,
      icon: <Video className="w-5 h-5 text-blue-600" />,
    },
    {
      id: '2',
      type: 'message',
      title: 'Lời mời họp mới',
      message: 'Nguyễn Văn A đã mời bạn vào cuộc họp Product Review',
      time: '30 phút trước',
      isRead: false,
      icon: <Users className="w-5 h-5 text-green-600" />,
    },
    {
      id: '3',
      type: 'system',
      title: 'Cuộc họp đã kết thúc',
      message: 'Bản ghi cuộc họp "Daily Standup" đã sẵn sàng',
      time: '2 giờ trước',
      isRead: true,
      icon: <Check className="w-5 h-5 text-gray-600" />,
    },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
              <p className="text-sm text-gray-500">{unreadCount} thông báo chưa đọc</p>
            )}
          </div>
        </DropdownMenuLabel>
        
        {/* <DropdownMenuSeparator /> */}

        <DropdownMenuGroup className="max-h-[450px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4">
              <Bell className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Không có thông báo mới</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`px-4 py-3 cursor-pointer focus:bg-gray-50 ${!notification.isRead ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex gap-3 w-full">
                  <div className="flex-shrink-0 mt-1">
                    {notification.icon || <Bell className="w-5 h-5 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{notification.time}</span>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>

        {/* <DropdownMenuSeparator /> */}
        
        {notifications.length > 0 && (
          <div className="p-2">
            <Button variant="ghost" className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium h-9">
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}