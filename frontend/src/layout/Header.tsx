import { BiLogoZoom } from "react-icons/bi";
import { Settings, Home, Video, CalendarDays } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { NotificationPanel } from "../components/pages/common/NotificationPanel";
import { ProfileDropdown } from "@/components/pages/ProfileMenu";
import { Link, useNavigate, useFormAction } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
interface HeaderProps {
  onOpenProfile: () => void;
  onToggleMenu: () => void;
}


export function Header({ onOpenProfile, onToggleMenu }: HeaderProps) {
  const { user } = useAuth();
  const navItems = [
    { label: "Home", href: "/home" },
    { label: "Meeting", href: "/meet" },
    { label: "Schedule", href: "/schedule" },
  ];

  
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
      {/* Left */}
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Link to="/home">
            <BiLogoZoom className="w-6 h-6 text-white" />
          </Link>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">ZUS Workplace</h1>
          <p className="text-xs text-gray-500">Kết nối mọi lúc, mọi nơi</p>
        </div>
        <NavigationMenu>
          <NavigationMenuList className="ml-10 gap-4">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.href}>
                <Link to={item.href}>
                  <NavigationMenuLink
                    className={cn(
                      "h-[45px] px-4 flex items-center text-[15px] font-medium transition-all relative",
                      location.pathname === item.href
                        ? "text-blue-600 after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                    )}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
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
