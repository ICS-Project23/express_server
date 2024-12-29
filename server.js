import express from 'express'; 
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AuthRouter } from './routes/AuthRoute.js';
import createBlockchainRouter from "./routes/BlockChainRoute.js";
import { ethers } from 'ethers';
import {Server} from 'socket.io'
import {createServer} from 'http'

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server);
const corsOptions = {
    origin: "http://localhost:3001", // Allow requests only from this origin
    methods: "GET,POST", // Allow only these HTTP methods
    allowedHeaders: "Content-Type", // Allow only these headers
    credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/auth",AuthRouter);
app.use("/blockchain", createBlockchainRouter(io));




app.get("/", (req, res) => {
    res.send("Welcome to the voter registration API");
})



/*
    * Connect application to mongodb
*/
const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};
const uri = process.env.MONGO_URI;
const PORT = process.env.PORT;

mongoose.connect(uri, clientOptions)
    .then(() => {
        console.log("Connected to MongoDB");
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT} .....`);
        });
        server.on("error", (error) => {
            if (error.code === "EADDRINUSE") {
                console.error(`Port ${PORT} is already in use`);
                // Try a different port
                const newPort = PORT + 1;
                server.listen(newPort, () => {
                    console.log(`Server is running on port ${newPort}`);
                });
            } else {
                throw error;
            }
        });
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB");
        console.log(error);
    })