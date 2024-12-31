import { Server } from "socket.io";
import app from "./Express.js";
import { createServer } from "http";

export const server = createServer(app);
const io = new Server(server);
export default io;
