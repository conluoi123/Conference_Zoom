const API_BASE_URL = "https://eudaemonistically-metallographical-kasha.ngrok-free.dev";

// Hàm core để xử lý tất cả các request (Handle Response & Build URL)
const request = async (path: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("accessToken");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle Response tập trung
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Lỗi hệ thống");
  }

  return response.json();
};

export const api = {
  get: (path: string, options?: RequestInit) =>
    request(path, { ...options, method: "GET" }),

  post: (path: string, data: any, options?: RequestInit) =>
    request(path, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    }),
};
