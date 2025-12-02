import { useState } from 'react';
import { Upload } from 'lucide-react';

const profileImage = 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60';

export function ProfileContent() {
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Khôi',
    email: 'nguyen.khoi@zus.com',
    phone: '+84 123 456 789',
    position: 'Product Manager',
    department: 'Product Team',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    console.log('Saving profile:', formData);
    alert('Đã lưu thông tin thành công!');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl text-gray-900 mb-1">Hồ sơ</h1>
        <p className="text-gray-500">Quản lý thông tin cá nhân của bạn</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-gray-900 mb-4">Ảnh đại diện</h3>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <Upload size={16} />
              Tải ảnh lên
            </button>
            <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg">
              Xóa ảnh
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          JPG, GIF hoặc PNG. Tối đa 2MB. Kích thước đề xuất: 400x400px
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-gray-900 mb-4">Thông tin cá nhân</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                // onChange={handleChange}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Vị trí công việc</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">Phòng ban</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Địa chỉ</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ của bạn"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
    </div>
  );
}