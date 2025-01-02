import { Server } from "socket.io";
import app from "./Express.js";
import { createServer } from "http";

export const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log("User connected");
    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
})
export default io;
