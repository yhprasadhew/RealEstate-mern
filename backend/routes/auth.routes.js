import express from 'express';
import { registerUser, verifyEmail, resendVerificationCode, forgotPassword, resetPassword, getUserProfile, loginUser } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const authRouter = express.Router();

authRouter.post("/register", registerUser);
authRouter.post("/login", loginUser);

authRouter.post("/me", protect, getUserProfile);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/resend-verification", resendVerificationCode);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);

export default authRouter;



