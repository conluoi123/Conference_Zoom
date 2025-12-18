import { Server, Socket } from "socket.io";
import { meetingSocketHandler } from "./events/meeting";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket: Socket) => {
    meetingSocketHandler(io, socket);
    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
    });
  });
};
