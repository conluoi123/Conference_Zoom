import api from "./service";
const AuthService = {
    checkRefreshToken: async() => {
        try {
            const data = await api.post("/auth/refreshToken/check");
            return data.data.flag;
        } catch (error) {
            console.log(error)
        }
    }
}
export {AuthService}