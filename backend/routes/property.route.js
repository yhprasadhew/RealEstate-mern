import express from 'express';
// Added missing 'addProperty' import below
import { 
  addProperty,
  deleteProperty, 
  getAllProperties, 
  getMyProperties, 
  getPropertyDetails, 
  getProprtyCounts, 
  getSellerDashboard, 
  updateProperty, 
  updatePropertyStatus 
} from '../controllers/property.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';
import upload from '../middlewares/upload.middleware.js';

const propertyRouter = express.Router();

// 1. Public List Route
propertyRouter.get("/", getAllProperties);

// 2. Static / Specific Routes (Must come BEFORE dynamic ID parameters)
propertyRouter.get("/counts", getProprtyCounts);
propertyRouter.get("/my", protect, authorize("seller"), getMyProperties);
propertyRouter.get("/seller/dashboard", protect, authorize("seller"), getSellerDashboard);

// 3. Dynamic ID Routes & Modifications
propertyRouter.post("/", protect, authorize("seller"), upload.array("images", 10), addProperty);
propertyRouter.put("/:id", protect, authorize("seller"), upload.array("images", 10), updateProperty);
propertyRouter.delete("/:id", protect, authorize("seller"), deleteProperty);
propertyRouter.patch("/:id/status", protect, authorize("seller"), updatePropertyStatus);

// Public Details Route (Moved to the bottom so it doesn't intercept "/counts", "/my", or "/seller/dashboard")
propertyRouter.get("/:id", getPropertyDetails);

export default propertyRouter;