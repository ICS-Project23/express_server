import express from 'express'; 
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { AuthRouter } from './routes/AuthRoute.js';

dotenv.config();

const app = express();
const corsOptions = {
    origin: "http://localhost:3000", // Allow requests only from this origin
    methods: "GET,POST", // Allow only these HTTP methods
    allowedHeaders: "Content-Type", // Allow only these headers
    credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use("/auth",AuthRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the voter registration API");
})

/*
    * COnnect application to mongodb
*/
const clientOptions = {
    serverApi: { version: "1", strict: true, deprecationErrors: true },
};
const uri = process.env.MONGO_URI;

mongoose.connect(uri, clientOptions)
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT} .....`);
        });
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB");
        console.log(error);
    })