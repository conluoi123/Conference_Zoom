import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const AuthService = {
  checkRefreshToken: async () => {
    try {
      const data = await axios.post(
        `${API_BASE_URL}/auth/refreshToken/check`,
        {},
        {
          withCredentials: true, // truyen cookie (trong coookie co refreshToken)
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        }
      );
      return data.data.flag;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return false;
      }
      throw error; 
    }
  },
};
export { AuthService };
