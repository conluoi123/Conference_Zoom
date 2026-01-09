import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
const AuthService = {
  checkRefreshToken: async () => {
    try {
      const data = await axios.post(`${API_BASE_URL}/auth/refreshToken/check`,{}, {
        withCredentials: true, // truyen cookie (trong coookie co refreshToken)
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
      console.log("data", data);
      return data.data.flag;
    } catch (error) {
        console.error("Error checking refresh token:", error);
        throw error;
    }
  },
};
export { AuthService };
