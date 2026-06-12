import express from "express";
import {
  createReview,
  getApprovedReviews,
  getAllReviewsAdmin,
  approveReviewAdmin,
  deleteReviewAdmin,
} from "../controllers/review.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const reviewRouter = express.Router();

// Public: Get all approved reviews
reviewRouter.get("/", getApprovedReviews);

// Protected: Submit a review
reviewRouter.post("/", protect, createReview);

// Admin Only: Get all reviews
reviewRouter.get("/all", protect, authorize("admin"), getAllReviewsAdmin);

// Admin Only: Approve a review
reviewRouter.patch("/:id/approve", protect, authorize("admin"), approveReviewAdmin);

// Admin Only: Delete a review
reviewRouter.delete("/:id", protect, authorize("admin"), deleteReviewAdmin);

export default reviewRouter;
