import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AuthRouter } from './routes/AuthRoute.js';
import {blockchainRouter} from "./routes/BlockChainRoute.js";
import app, {server} from './config/Express.js';
import { ElectionRouter } from './routes/Election.js';
import { CandidateRouter } from './routes/Candidate.js';
import { wss } from './config/WebSocket.js';


dotenv.config();

wss.on("connection", (ws) => {
    console.log("User connected");
    ws.on("message", (message) => {
        let msg = JSON.parse(message);
        console.log("Message from client:");
        console.log(msg);
        let payload = {
            "event": "pong"
        }
        ws.send(JSON.stringify(payload))
    });
    ws.on("close", () => {
        console.log("User disconnected");
    });
});

app.use("/auth",AuthRouter);
app.use("/vote", blockchainRouter);
app.use("/election", ElectionRouter)
app.use("/candidate", CandidateRouter)
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