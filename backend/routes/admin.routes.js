import express from "express";

import {
  blockUser,
  deletePropertyAdmin,
  deleteUser,
  getAllInquiries,
  getAllPropertiesAdmin,
  getAllUsers,
  getDashboardStats,
  getPendingSellers,
  approveSeller,
} from "../controllers/admin.controller.js";

import { protect, authorize } from "../middlewares/auth.middleware.js";

const adminRouter = express.Router();

// Protect all admin routes
adminRouter.use(protect, authorize("admin"));

// Users
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/block", blockUser);
adminRouter.delete("/users/:id", deleteUser);

// Properties
adminRouter.get("/properties", getAllPropertiesAdmin);
adminRouter.delete("/properties/:id", deletePropertyAdmin);

// Inquiries
adminRouter.get("/inquiries", getAllInquiries);

// Dashboard
adminRouter.get("/stats", getDashboardStats);

// Seller Approval
adminRouter.get("/pending-sellers", getPendingSellers);
adminRouter.patch("/sellers/:id/approve", approveSeller);

export default adminRouter;