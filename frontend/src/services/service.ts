import axios, { AxiosError, type AxiosRequestConfig } from "axios";

let token = "";

// xu ly neu khong xac thuc duoc lai bang refresh token thi ra login page
let onLogout: () => void;

export const setLogoutHandler = (logoutContext: () => void) => {
  onLogout = logoutContext;
};

export const setAccessToken = (accessToken: string) => {
  token = accessToken;
};

export const getAccessToken = () => token;
// const API_BASE_URL = "https://eudaemonistically-metallographical-kasha.ngrok-free.dev";
// const API_BASE_URL = "https://biserial-subattenuate-arie.ngrok-free.dev";
const API_BASE_URL = "https://israel-ramose-premeditatingly.ngrok-free.dev";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // truyen cookie (trong coookie co refreshToken)
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

// gan accessToken
api.interceptors.request.use(
  (config) => {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token || ""}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// biến toàn cục cái này sẽ bật true mỗi khi có yêu cầu cần refresh
let isRefreshing = false;

type FailedRequest = {
  resolve: (token: string) => void; // giải quyết request bị lỗi 401
  reject: (error: any) => void; // báo lõi từ chối các request bị lỗi 401
};

// hàng chờ chứa các request bị lỗi 401
let failedQueue: FailedRequest[] = [];

// hàng chờ xu ly request lõi
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    error ? p.reject(error) : p.resolve(token!);
  });
  failedQueue = []; // hủy hàng chờ
};

api.interceptors.response.use(
  (response) => response, // thành công thì respond k thì bên dưới là xử lí lõi

  async (error: AxiosError) => {
    const req = error.config as AxiosRequestConfig & {
      retry?: boolean; // add thêm thuộc tính retry để xác định xem đã refresh token chưa
    };

    // nếu respond khác 401 thì hủy vì là do lõi khác kp là lỗi liên quan token
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // nếu đã yêu cầu refresh token rồi mà vẫn k được thì hủy để tránh lặp vô tận
    if (req.retry) {
      return Promise.reject(error);
    }

    req.retry = true; // set là đã có yêu cầu refresh

    // nếu đã có yêu cầu refresh chưa được giải quyết xong thì thêm yêu cầu hiện tại vào queue rồi giải quyết
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            req.headers = req.headers ?? {};
            req.headers.Authorization = `Bearer ${token}`;
            resolve(api(req));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    // gửi yêu cầu refreshToken
    try {
      const res = await api.post("/auth/refreshToken");

      // Nếu thành công thì xử lý lưu lại accessToken mới chuẩn bị cho phiên xử lý sau
      const newAccessToken = res.data.accessToken;
      setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      req.headers = req.headers ?? {};
      req.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(req);
    } catch (Error) {
      processQueue(Error, null);
      setAccessToken("");
      onLogout();
      return Promise.reject(Error);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
