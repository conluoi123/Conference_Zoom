import { io } from "socket.io-client";

// URL nên đưa vào biến môi trường (Environment Variable)
// const SOCKET_URL = "https://phonotypical-abram-drowsier.ngrok-free.dev";
const SOCKET_URL = import.meta.env.VITE_API_URL;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Ép dùng websocket để ổn định với ngrok
  reconnection: true,
  autoConnect: false, // Quan trọng: Để mình tự chủ động connect khi cần
});
