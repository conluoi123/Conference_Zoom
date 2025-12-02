import { useState } from 'react';
import { X } from 'lucide-react';
import { ProfileSidebar } from './ProfileSidebar';
import { ProfileContent } from './ProfileContent';
import { MeetingsSettings } from './MeetingsSettings';
import { CalendarSettings } from './CalendarSettings';
import { NotificationsSettings } from './NotificationsSettings';
import { PrivacySettings } from './PrivacySettings';

export type PageType = 'profile' | 'meetings' | 'calendar' | 'notifications' | 'privacy';

interface ProfileModalProps {
  onClose: () => void;
  chosenPage?: PageType;
}

export function ProfileModal({ onClose, chosenPage }: ProfileModalProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(chosenPage || 'profile');

  const renderContent = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfileContent />;
      case 'meetings':
        return <MeetingsSettings />;
      case 'calendar':
        return <CalendarSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'privacy':
        return <PrivacySettings />;
      default:
        return <ProfileContent />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex">
        <ProfileSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
        
        <div className="flex-1 flex flex-col">
          <div className="flex items-center justify-end px-6 py-4 border-b border-gray-200">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
          
          <div className="flex-1 overflow-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}