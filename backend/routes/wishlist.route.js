import express from "express";
import {
  addWishlist,
  getWishlist,
  removeWishlist,
} from "../controllers/wishlist.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const wishlistRouter = express.Router();

// Get user's wishlist
wishlistRouter.get("/", protect, getWishlist);

// Add property to wishlist
wishlistRouter.post("/:propertyId", protect, addWishlist);

// Remove property from wishlist
wishlistRouter.delete("/:propertyId", protect, removeWishlist);

export default wishlistRouter;