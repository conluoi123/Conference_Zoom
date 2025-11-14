import { io } from "../server";

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {});
});
