import axios from "axios";
const AuthService = {
    checkRefreshToken: async() => {
        try {
            const data = await axios.post("/auth/refreshToken/check");
            return data.data.flag;
        } catch (error) {
        }
    }
}
export {AuthService}