import { useRef, useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  profileAPI,
  type RequestProfileData,
  type AccountType,
  type UpdateProfileData,
} from "@/services/profileApi";
const profileImage =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZmlsZSUyMGltYWdlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60";

interface ProfileData {
  displayName: string;
  email: string;
  avatar: string;
  accountType: AccountType;
}
export function ProfileContent() {
  const { user, logout, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  if (!user) {
    logout();
  }
  // setAvatar(user?.avatar || "");
  const [formData, setFormData] = useState<ProfileData>({
    displayName: "",
    email: "",
    avatar: user?.avatar || "",
    accountType: {
      accType: "",
      maxDuration: 0,
      maxParticipants: 0,
      expiredAt: new Date(),
    } as AccountType,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        logout();
        return;
      }
      try {
        const requestProfileData: RequestProfileData = {
          userId: user.id || "",
        };
        const profile = await profileAPI.getUserProfile(requestProfileData);

        if (!profile) return;
        setFormData({
          displayName: profile.displayName ?? "",
          email: profile.email,
          avatar: profile.avatar,
          accountType: profile.accountType,
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    const updateProfileData: UpdateProfileData = {
      userId: user?.id || "",
      displayName: formData.displayName,
      avatar: formData.avatar,
      accountType: formData.accountType,
    };
    await profileAPI.updateUserProfile(updateProfileData);
  };

  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) {
        alert("Chưa chọn file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File quá lớn");
        return;
      }
      setIsLoading(true);
      const signature = await profileAPI.getSignature();

      const formDataBody = new FormData();
      formDataBody.append("file", file);
      formDataBody.append("api_key", signature.apiKey);
      formDataBody.append("timestamp", signature.timestamp);
      formDataBody.append("signature", signature.signature);
      formDataBody.append("folder", "avatars");

      const data = await profileAPI.uploadFile(
        formDataBody,
        signature.cloudName
      );

      const url = await profileAPI.saveAvatar(user?.id || "", data.public_id);
      updateUser({ avatar: url });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    alert("Đã lưu thông tin thành công!");
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
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 relative">
            <img
              src={user?.avatar ? user.avatar : profileImage}
              alt="Profile"
              className={`w-full h-full object-cover transition-opacity ${
                isLoading ? "opacity-50" : "opacity-100"
              }`}
            />

            {isLoading && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            hidden
            ref={fileInputRef}
            onChange={handleUploadImage}
          />
          <div className="flex gap-2">
            <button
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white
                ${
                  isLoading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              <Upload size={16} />
              {isLoading ? "Đang tải..." : "Tải ảnh lên"}
            </button>

            {/* <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg">
              Xóa ảnh
            </button> */}
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
            <label className="block text-sm text-gray-700 mb-2">
              Tên hiển thị
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
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
              <label className="block text-sm text-gray-700 mb-2">
                Loại tài khoản
              </label>
              <input
                type="tel"
                name="accType"
                value={formData.accountType.accType}
                // onChange={handleChange}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Thời lượng tối đa khi tạo cuộc họp
              </label>
              <input
                type="text"
                name="maxDuration"
                value={formData.accountType.maxDuration?.toString() || ""}
                readOnly
                // onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Số người tham gia tối đa khi tạo cuộc họp
              </label>
              <input
                type="text"
                name="maxParticipants"
                value={formData.accountType.maxParticipants?.toString() || ""}
                // onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Ngày hết hạn
            </label>
            <input
              type="text"
              name="expiredAt"
              value={formData.accountType.expiredAt?.toString() || ""}
              // onChange={handleChange}
              readOnly
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-gray-200 text-gray-500 cursor-not-allowed"
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
