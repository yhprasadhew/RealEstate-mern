import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";

//.. Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);


app.get("/", (req, res) => {
  res.send("API is running...");
});


// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});





//{
  //"name": "pasan",
  //"email": "yhprasadhew@gmail.com",
  