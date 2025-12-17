import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { ProfileMenu } from "../components/pages/ProfilePage";
import { ProfileModal } from "../components/pages/ProfilePageModal";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleToggleProfileMenu = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const handleOpenSettings = () => {
    setShowProfileMenu(false);
    setShowProfileModal(true);
  };

  return (
    <div className="w-screen h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Header
        onOpenProfile={handleOpenSettings}
        onToggleMenu={handleToggleProfileMenu}
      />

      <main className="flex-1 overflow-auto">{children}</main>

      {/* Profile Menu Dropdown */}
      {showProfileMenu && (
        <ProfileMenu
          onClose={() => setShowProfileMenu(false)}
          onOpenProfile={() => {
            setShowProfileMenu(false);
            setShowProfileModal(true);
          }}
        />
      )}

      {/* Profile / Settings Modal */}
      {showProfileModal && (
        <ProfileModal onClose={() => setShowProfileModal(false)} />
      )}
    </div>
  );
}
