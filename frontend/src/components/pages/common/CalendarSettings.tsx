import { useState } from 'react';

export function CalendarSettings() {
  const [settings, setSettings] = useState({
    defaultView: 'week',
    startDay: 'monday',
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00',
    showWeekends: true,
    defaultMeetingDuration: '30',
    reminderTime: '15',
    autoDeclineConflicts: false,
  });

  const handleChange = (key: string, value: string | boolean) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleSave = () => {
    console.log('Saving calendar settings:', settings);
    alert('Đã lưu cài đặt lịch!');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Cài đặt lịch</h1>
        <p className="text-gray-500">Tùy chỉnh cách hiển thị và quản lý lịch của bạn</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-gray-900 mb-4">Hiển thị</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Chế độ xem mặc định</label>
              <select
                value={settings.defaultView}
                onChange={(e) => handleChange('defaultView', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="day">Ngày</option>
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Ngày bắt đầu tuần</label>
              <select
                value={settings.startDay}
                onChange={(e) => handleChange('startDay', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="sunday">Chủ nhật</option>
                <option value="monday">Thứ hai</option>
              </select>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 text-sm mb-1">Hiển thị cuối tuần</h4>
                <p className="text-sm text-gray-500">Hiển thị thứ 7 và Chủ nhật trong lịch</p>
              </div>
              <button
                onClick={() => handleChange('showWeekends', !settings.showWeekends)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.showWeekends ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.showWeekends ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Giờ làm việc</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Giờ bắt đầu</label>
              <input
                type="time"
                value={settings.workingHoursStart}
                onChange={(e) => handleChange('workingHoursStart', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Giờ kết thúc</label>
              <input
                type="time"
                value={settings.workingHoursEnd}
                onChange={(e) => handleChange('workingHoursEnd', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-gray-900 mb-4">Cuộc họp</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Thời lượng cuộc họp mặc định</label>
              <select
                value={settings.defaultMeetingDuration}
                onChange={(e) => handleChange('defaultMeetingDuration', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="15">15 phút</option>
                <option value="30">30 phút</option>
                <option value="45">45 phút</option>
                <option value="60">60 phút</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Nhắc nhở trước</label>
              <select
                value={settings.reminderTime}
                onChange={(e) => handleChange('reminderTime', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="5">5 phút</option>
                <option value="10">10 phút</option>
                <option value="15">15 phút</option>
                <option value="30">30 phút</option>
              </select>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-gray-900 text-sm mb-1">Tự động từ chối cuộc họp trùng lịch</h4>
                <p className="text-sm text-gray-500">Từ chối các lời mời họp trùng với lịch hiện có</p>
              </div>
              <button
                onClick={() => handleChange('autoDeclineConflicts', !settings.autoDeclineConflicts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoDeclineConflicts ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoDeclineConflicts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
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
