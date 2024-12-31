import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";



const app = express()
const corsOptions = {
    origin: "http://localhost:3001", // Allow requests only from this origin
    methods: "GET,POST", // Allow only these HTTP methods
    allowedHeaders: "Content-Type", // Allow only these headers
    credentials: true, // Allow cookies to be sent
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

export default app;