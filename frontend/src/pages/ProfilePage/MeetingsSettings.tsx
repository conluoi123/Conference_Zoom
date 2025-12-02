import { useState } from 'react';

export function MeetingsSettings() {
  const [settings, setSettings] = useState({
    autoStartVideo: true,
    autoStartAudio: false,
    enableWaitingRoom: true,
    recordMeetings: false,
    showParticipantNames: true,
    enableChat: true,
    enableScreenShare: true,
    muteOnEntry: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSave = () => {
    console.log('Saving meeting settings:', settings);
    alert('Đã lưu cài đặt cuộc họp!');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Cài đặt cuộc họp</h1>
        <p className="text-gray-500">Tùy chỉnh các thiết lập mặc định cho cuộc họp của bạn</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-gray-900 mb-4">Thiết lập chung</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Tự động bật video khi vào cuộc họp"
              description="Camera sẽ được bật tự động khi bạn tham gia cuộc họp"
              checked={settings.autoStartVideo}
              onChange={() => handleToggle('autoStartVideo')}
            />
            <SettingToggle
              label="Tự động bật âm thanh khi vào cuộc họp"
              description="Microphone sẽ được bật tự động khi bạn tham gia cuộc họp"
              checked={settings.autoStartAudio}
              onChange={() => handleToggle('autoStartAudio')}
            />
            <SettingToggle
              label="Tắt tiếng khi vào phòng họp"
              description="Tự động tắt tiếng người tham gia khi vào cuộc họp"
              checked={settings.muteOnEntry}
              onChange={() => handleToggle('muteOnEntry')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Bảo mật</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Bật phòng chờ"
              description="Yêu cầu người tham gia đợi cho đến khi được chấp nhận vào cuộc họp"
              checked={settings.enableWaitingRoom}
              onChange={() => handleToggle('enableWaitingRoom')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Tính năng</h3>
          <div className="space-y-4">
            <SettingToggle
              label="Hiển thị tên người tham gia"
              description="Tên người tham gia sẽ được hiển thị trên video của họ"
              checked={settings.showParticipantNames}
              onChange={() => handleToggle('showParticipantNames')}
            />
            <SettingToggle
              label="Cho phép trò chuyện"
              description="Người tham gia có thể gửi tin nhắn trong cuộc họp"
              checked={settings.enableChat}
              onChange={() => handleToggle('enableChat')}
            />
            <SettingToggle
              label="Cho phép chia sẻ màn hình"
              description="Người tham gia có thể chia sẻ màn hình của họ"
              checked={settings.enableScreenShare}
              onChange={() => handleToggle('enableScreenShare')}
            />
            <SettingToggle
              label="Tự động ghi hình cuộc họp"
              description="Cuộc họp sẽ được ghi hình tự động khi bắt đầu"
              checked={settings.recordMeetings}
              onChange={() => handleToggle('recordMeetings')}
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

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function SettingToggle({ label, description, checked, onChange }: SettingToggleProps) {
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
