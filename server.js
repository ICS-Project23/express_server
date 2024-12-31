import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { AuthRouter } from './routes/AuthRoute.js';
import {blockchainRouter} from "./routes/BlockChainRoute.js";
import app from './config/Express.js';
import { server } from './config/SocketIO.js';
import { ElectionRouter } from './routes/Election.js';
import { CandidateRouter } from './routes/Candidate.js';

dotenv.config();


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