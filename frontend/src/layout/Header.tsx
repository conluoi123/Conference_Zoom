import { BiLogoZoom } from "react-icons/bi";
import { Bell, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onOpenProfile: () => void;
  onToggleMenu: () => void;
  showProfileMenu: boolean;
}

export function Header({ onOpenProfile, onToggleMenu, showProfileMenu }: HeaderProps) {
  const { user } = useAuth();
  
  const displayName = user?.displayName || 'User';
  const email = user?.email || '';
  
  // Get initials from display name
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <BiLogoZoom className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ZUS Workplace</h1>
          <p className="text-xs text-gray-500">Kết nối mọi lúc, mọi nơi</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button 
          onClick={onOpenProfile}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>

        <div className="relative">
          <button 
            onClick={onToggleMenu}
            className="flex items-center gap-3 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">
                {getInitials(displayName)}
              </span>
            </div>
            <div className="text-left hidden md:block">
              <div className="text-sm font-medium text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-500">{email}</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}