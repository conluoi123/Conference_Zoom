import { io } from "socket.io-client";

// URL nên đưa vào biến môi trường (Environment Variable)
// const SOCKET_URL = "https://phonotypical-abram-drowsier.ngrok-free.dev";
const SOCKET_URL = import.meta.env.VITE_API_URL;

export const socket = io(SOCKET_URL, {
  transports: ["websocket"], // Ép dùng websocket để ổn định với ngrok
  reconnection: true,
  autoConnect: false, // Quan trọng: Để mình tự chủ động connect khi cần
});

/*
  roomId: ID phòng họp 
  participantId: ID của bạn 
  email: đc người được mời thông qua email
*/
export const inviteByEmail = (roomId: string, participantId: string, email:string) => {
  socket.emit("meeting:invite", {roomId, participantId, email}); 
}; 

/*
  roomId: ID phòng họp 
  participantId: ID của bạn 
  settings: settings mới 
*/

export const updateMeetingSettings = (roomId: string, participantId: string, settings: any) => {
  socket.emit("meeting:settings", {roomId, participantId, settings});
}; 

