import { BiLogoZoom } from "react-icons/bi";
import { Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationPanel } from "../components/pages/common/NotificationPanel";
import { ProfileDropdown } from "@/components/pages/ProfileMenu";
interface HeaderProps {
  onOpenProfile: () => void;
  onToggleMenu: () => void;
}

export function Header({ onOpenProfile, onToggleMenu }: HeaderProps) {
  const { user } = useAuth();

  const displayName = user?.displayName || "User";
  const email = user?.email || "";

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <BiLogoZoom className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ZUS Workplace</h1>
          <p className="text-xs text-gray-500">Kết nối mọi lúc, mọi nơi</p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Notification (tự quản lý state) */}
        <NotificationPanel />

        {/* Settings */}
        <button
          onClick={onOpenProfile}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
        <ProfileDropdown onOpenProfile={onOpenProfile} />
      </div>
    </header>
  );
}
