import express from "express";

import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

import {
  getProfile,
  updateProfile,
  getPublicProfile,
} from "../controllers/user.controller.js";

const userRouter = express.Router();

// Get logged-in user profile
userRouter.get("/profile", protect, getProfile);

// Update profile
userRouter.put(
  "/profile",
  protect,
  upload.single("profilePic"),
  updateProfile
);

// Get public profile
userRouter.get("/public/:id", getPublicProfile);

export default userRouter;