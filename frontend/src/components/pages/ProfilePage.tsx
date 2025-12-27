import { User, UserPlus, Settings, LogOut } from "lucide-react";
import { useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

interface ProfileMenuProps {
  onClose: () => void;
  onOpenProfile: () => void;
}

export function ProfileMenu({ onClose, onOpenProfile }: ProfileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  const displayName = user?.displayName || "User";
  const email = user?.email || "";

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleViewProfile = () => {
    onClose();
    onOpenProfile();
  };

  const handleAddAccount = () => {
    alert("Thêm tài khoản mới");
    onClose();
  };

  const handleLogOut = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      logout(); // Use AuthContext logout
      onClose();
    }
  };

  return (
    <div
      ref={menuRef}
      className="absolute top-full right-6 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
    >
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">
              {getInitials(displayName)}
            </span>
          </div>
          <div>
            <div className="text-gray-900 font-medium">{displayName}</div>
            <div className="text-sm text-gray-500">{email}</div>
          </div>
        </div>
      </div>

      <div className="py-2">
        <button
          onClick={handleViewProfile}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <User size={18} className="text-blue-600" />
          <div className="text-left">
            <div className="text-sm">View Profile</div>
            <div className="text-xs text-gray-500">Xem và chỉnh sửa hồ sơ</div>
          </div>
        </button>

        <button
          onClick={handleAddAccount}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <UserPlus size={18} className="text-purple-600" />
          <div className="text-left">
            <div className="text-sm">Add Account</div>
            <div className="text-xs text-gray-500">Thêm tài khoản mới</div>
          </div>
        </button>

        <button
          onClick={handleViewProfile}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700 transition-colors"
        >
          <Settings size={18} className="text-gray-600" />
          <div className="text-left">
            <div className="text-sm">Settings</div>
            <div className="text-xs text-gray-500">Cài đặt ứng dụng</div>
          </div>
        </button>
      </div>

      <div className="border-t border-gray-200 pt-2">
        <button
          onClick={handleLogOut}
          className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-red-600 transition-colors"
        >
          <LogOut size={18} />
          <div className="text-left">
            <div className="text-sm">Log Out</div>
            <div className="text-xs text-red-500">Đăng xuất tài khoản</div>
          </div>
        </button>
      </div>
    </div>
  );
}
