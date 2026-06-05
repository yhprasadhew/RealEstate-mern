import express from "express";
import {
  sendInquiry,
  getSellerInquiries,
  markAsRead,
} from "../controllers/inquiry.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const inquiryRouter = express.Router();


// Seller views inquiries
inquiryRouter.get("/seller", protect, authorize("seller"), getSellerInquiries);


// Buyer sends inquiry
inquiryRouter.post("/", protect, authorize("buyer"), sendInquiry);

// Seller marks inquiry as read
inquiryRouter.patch("/:id/read", protect, authorize("seller"), markAsRead);

export default inquiryRouter;