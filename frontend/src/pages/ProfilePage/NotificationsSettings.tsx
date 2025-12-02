import { useState } from 'react';

export function NotificationsSettings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    desktopNotifications: false,
    meetingReminders: true,
    meetingInvites: true,
    chatMessages: true,
    mentions: true,
    scheduledChanges: true,
    weeklyDigest: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
    alert('Đã lưu cài đặt thông báo!');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Cài đặt thông báo</h1>
        <p className="text-gray-500">Quản lý cách bạn nhận thông báo</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-gray-900 mb-4">Phương thức thông báo</h3>
          <div className="space-y-4">
            <NotificationToggle
              label="Thông báo qua email"
              description="Nhận thông báo qua địa chỉ email của bạn"
              checked={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <NotificationToggle
              label="Thông báo đẩy"
              description="Nhận thông báo đẩy trên thiết bị di động"
              checked={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <NotificationToggle
              label="Thông báo trên desktop"
              description="Hiển thị thông báo trên màn hình desktop"
              checked={settings.desktopNotifications}
              onChange={() => handleToggle('desktopNotifications')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Cuộc họp</h3>
          <div className="space-y-4">
            <NotificationToggle
              label="Nhắc nhở cuộc họp"
              description="Nhận thông báo nhắc nhở trước khi cuộc họp bắt đầu"
              checked={settings.meetingReminders}
              onChange={() => handleToggle('meetingReminders')}
            />
            <NotificationToggle
              label="Lời mời họp"
              description="Nhận thông báo khi được mời tham gia cuộc họp"
              checked={settings.meetingInvites}
              onChange={() => handleToggle('meetingInvites')}
            />
            <NotificationToggle
              label="Thay đổi lịch họp"
              description="Nhận thông báo khi có thay đổi về thời gian hoặc hủy cuộc họp"
              checked={settings.scheduledChanges}
              onChange={() => handleToggle('scheduledChanges')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Tin nhắn</h3>
          <div className="space-y-4">
            <NotificationToggle
              label="Tin nhắn mới"
              description="Nhận thông báo khi có tin nhắn mới"
              checked={settings.chatMessages}
              onChange={() => handleToggle('chatMessages')}
            />
            <NotificationToggle
              label="Được nhắc đến"
              description="Nhận thông báo khi ai đó nhắc đến bạn trong tin nhắn"
              checked={settings.mentions}
              onChange={() => handleToggle('mentions')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Tổng hợp</h3>
          <div className="space-y-4">
            <NotificationToggle
              label="Báo cáo hàng tuần"
              description="Nhận email tổng hợp hoạt động hàng tuần"
              checked={settings.weeklyDigest}
              onChange={() => handleToggle('weeklyDigest')}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button className="px-6 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg">
            Hủy
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function NotificationToggle({ label, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="text-gray-900 text-sm mb-1">{label}</h4>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
