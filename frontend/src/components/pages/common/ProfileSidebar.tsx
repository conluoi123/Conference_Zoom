import { User, Video, Calendar, Bell, Shield } from 'lucide-react';
export type PageType = 'profile' | 'meetings' | 'calendar' | 'notifications' | 'privacy';

interface ProfileSidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

interface MenuItem {
  id: PageType;
  label: string;
  icon: React.ReactNode;
}

export function ProfileSidebar({ currentPage, onPageChange }: ProfileSidebarProps) {
  const accountItems: MenuItem[] = [
    { id: 'profile', label: 'Hồ sơ', icon: <User size={18} /> },
  ];

  const settingsItems: MenuItem[] = [
    { id: 'meetings', label: 'Cuộc họp', icon: <Video size={18} /> },
    { id: 'calendar', label: 'Lịch', icon: <Calendar size={18} /> },
    { id: 'notifications', label: 'Thông báo', icon: <Bell size={18} /> },
    { id: 'privacy', label: 'Quyền riêng tư', icon: <Shield size={18} /> },
  ];

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-200 p-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
          <User size={32} className="text-white" />
        </div>
        <div>
          <h3 className="text-gray-900">Nguyễn Khôi</h3>
          <p className="text-sm text-gray-500">nguyen.khoi@zus.com</p>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-xs text-gray-500 mb-2 px-3">TÀI KHOẢN</h4>
        <nav className="space-y-1">
          {accountItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div>
        <h4 className="text-xs text-gray-500 mb-2 px-3">CÀI ĐẶT</h4>
        <nav className="space-y-1">
          {settingsItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}