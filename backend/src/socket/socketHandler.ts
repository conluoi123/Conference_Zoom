import { Server, Socket } from "socket.io";
import { meetingSocketHandler } from "./events/meeting";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    console.log(`Socket connected: ${socket.id}`);
    meetingSocketHandler(io, socket);
  });
};
