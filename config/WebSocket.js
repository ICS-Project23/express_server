import { WebSocket } from "ws";
import {server} from "./Express.js";

export const wss = new WebSocket.Server({ server });

