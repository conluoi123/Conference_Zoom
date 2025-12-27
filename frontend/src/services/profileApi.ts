interface RequestProfileData {
  userId: string;
}

interface AccountType {
  accType: string;
  maxDuration: Number;
  maxParticipants: Number;
  expiredAt: Date;
}

interface UpdateProfileData {
  userId: String;
  displayName?: string;
  avatar?: string;
  accountType?: AccountType;
}

import axios from "axios";
import api from "./service";

export const profileAPI = {
  getUserProfile: async (request?: RequestProfileData) => {
    try {
      const { userId } = request || {};
      console.log(userId);
      const response = await api.get(`/${userId}/info`, {
        params: {
          userId,
        },
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }
        console.error("Lỗi BE:", error.response.data);
        throw new Error(
          error.response.data.message || "Lấy thông tin thất bại"
        );
      }

      console.error("Lỗi hệ thống:", error.message);
      throw error;
    }
  },

  updateUserProfile: async (updateProfileData: UpdateProfileData) => {
    try {
      const { userId, displayName, avatar, accountType } = updateProfileData;

      const requestBody = {
        userId,
        displayName,
        avatar,
        accountType,
      };

      const response = await api.patch(`/${userId}/update`, requestBody);

      return response.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }

        throw new Error(
          error.response.data?.message ||
            "Cập nhật thông tin người dùng thất bại"
        );
      }

      throw new Error("Không thể kết nối đến server");
    }
  },
  getSignature: async () => {
    try {
      const signature = await api.get("/signature");
      if (!signature) {
        console.log("Lấy chữ kí thất bại");
        return;
      }
      return signature.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }

        throw new Error(
          error.response.data?.message || "Lấy chữ kí cloud thất bại"
        );
      }

      throw new Error("Không thể kết nối đến server");
    }
  },
  saveAvatar: async (userId: string, publicId: string) => {
    try {
      const requestBody = {
        userId,
        publicId,
      };
      const data = await api.post("/saveAvatar", requestBody);
      if (!data) {
        console.log("Loi khi luu database");
        return;
      }
      return data.data.url;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }

        throw new Error(
          error.response.data?.message || "Lấy avatar url thất bại"
        );
      }

      throw new Error("Không thể kết nối đến server");
    }
  },
  uploadFile: async (formData: FormData, cloudName: string) => {
    try {
      const data = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          withCredentials: false,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (!data) {
        console.log("Loi khi upload file");
        return;
      }
      return data.data;
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 404) {
          return {
            success: false,
            error: "Tài khoản không tồn tại",
          };
        }

        throw new Error(
          error.response.data?.message || "Lấy avatar url thất bại"
        );
      }

      throw new Error("Không thể kết nối đến server");
    }
  },
};

export default {
  profile: profileAPI,
};

export type { RequestProfileData, AccountType, UpdateProfileData };
