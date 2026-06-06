import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.route.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import wishlistRouter from "./routes/wishlist.route.js";
import contactRouter from "./routes/contact.route.js";
import adminRouter from "./routes/admin.routes.js";

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
app.use ("/api/user", userRouter);
app.use ("/api/property", propertyRouter);
app.use("/api/inquiry", inquiryRouter);
app.use ("/api/wishlist" , wishlistRouter);
app.use ("/api/contact", contactRouter) ;
app.use ("/api/admin", adminRouter) ;

app.get("/", (req, res) => {
  res.send("API is running...");
});


// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});




