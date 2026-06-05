import express from "express";
import { createContact, getAllContacts } from "../controllers/contact.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js"; // Added missing middlewares

const contactRouter = express.Router(); // Fixed lowercase 'router' bug

// Public: Create a contact request
contactRouter.post("/", createContact);

// Admin Only: Fetch all contact messages
contactRouter.get("/", protect, authorize("admin"), getAllContacts); // Fixed spacing typos

export default contactRouter;