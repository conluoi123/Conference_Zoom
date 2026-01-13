import { useState } from 'react';

export function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisibility: 'everyone',
    statusVisibility: 'contacts',
    lastSeenVisibility: 'contacts',
    allowCallsFrom: 'everyone',
    allowMessagesFrom: 'everyone',
    shareTypingStatus: true,
    shareReadReceipts: true,
    allowInvites: true,
    dataCollection: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    if (typeof settings[key] === 'boolean') {
      setSettings({
        ...settings,
        [key]: !settings[key],
      });
    }
  };

  const handleChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSave = () => {
    console.log('Saving privacy settings:', settings);
    alert('Đã lưu cài đặt quyền riêng tư!');
  };

  const handleExportData = () => {
    alert('Đang chuẩn bị xuất dữ liệu của bạn...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
      alert('Đã gửi yêu cầu xóa tài khoản!');
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Quyền riêng tư</h1>
        <p className="text-gray-500">Kiểm soát ai có thể xem thông tin và liên hệ với bạn</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-gray-900 mb-4">Hiển thị thông tin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Ai có thể xem hồ sơ của bạn</label>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleChange('profileVisibility', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="everyone">Mọi người</option>
                <option value="contacts">Chỉ liên hệ</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Ai có thể xem trạng thái của bạn</label>
              <select
                value={settings.statusVisibility}
                onChange={(e) => handleChange('statusVisibility', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="everyone">Mọi người</option>
                <option value="contacts">Chỉ liên hệ</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Ai có thể xem lần truy cập cuối</label>
              <select
                value={settings.lastSeenVisibility}
                onChange={(e) => handleChange('lastSeenVisibility', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="everyone">Mọi người</option>
                <option value="contacts">Chỉ liên hệ</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Liên hệ</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Ai có thể gọi cho bạn</label>
              <select
                value={settings.allowCallsFrom}
                onChange={(e) => handleChange('allowCallsFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="everyone">Mọi người</option>
                <option value="contacts">Chỉ liên hệ</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Ai có thể nhắn tin cho bạn</label>
              <select
                value={settings.allowMessagesFrom}
                onChange={(e) => handleChange('allowMessagesFrom', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="everyone">Mọi người</option>
                <option value="contacts">Chỉ liên hệ</option>
                <option value="nobody">Không ai</option>
              </select>
            </div>

            <PrivacyToggle
              label="Cho phép lời mời tham gia nhóm"
              description="Cho phép người khác mời bạn vào nhóm"
              checked={settings.allowInvites}
              onChange={() => handleToggle('allowInvites')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Hoạt động</h3>
          <div className="space-y-4">
            <PrivacyToggle
              label="Chia sẻ trạng thái đang nhập"
              description="Cho phép người khác thấy khi bạn đang soạn tin nhắn"
              checked={settings.shareTypingStatus}
              onChange={() => handleToggle('shareTypingStatus')}
            />
            <PrivacyToggle
              label="Chia sẻ xác nhận đã đọc"
              description="Cho phép người khác biết bạn đã đọc tin nhắn của họ"
              checked={settings.shareReadReceipts}
              onChange={() => handleToggle('shareReadReceipts')}
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Dữ liệu</h3>
          <div className="space-y-4">
            <PrivacyToggle
              label="Thu thập dữ liệu để cải thiện trải nghiệm"
              description="Cho phép chúng tôi thu thập dữ liệu ẩn danh để cải thiện dịch vụ"
              checked={settings.dataCollection}
              onChange={() => handleToggle('dataCollection')}
            />
            
            <div className="flex items-center justify-between pt-2">
              <div>
                <h4 className="text-gray-900 text-sm mb-1">Xuất dữ liệu</h4>
                <p className="text-sm text-gray-500">Tải xuống một bản sao dữ liệu của bạn</p>
              </div>
              <button 
                onClick={handleExportData}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg"
              >
                Xuất dữ liệu
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-red-600 mb-4">Vùng nguy hiểm</h3>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-gray-900 text-sm mb-1">Xóa tài khoản</h4>
                <p className="text-sm text-gray-600">
                  Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn. Hành động này không thể hoàn tác.
                </p>
              </div>
              <button 
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg whitespace-nowrap ml-4"
              >
                Xóa tài khoản
              </button>
            </div>
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

interface PrivacyToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function PrivacyToggle({ label, description, checked, onChange }: PrivacyToggleProps) {
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
