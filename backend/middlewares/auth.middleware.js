import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Protect Routes
export const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authorized, token missing",
            });
        }

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Get user without password
        req.user = await User.findById(
            decoded.id
        ).select("-password");

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if blocked
        if (req.user.isBlocked) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account has been blocked by admin",
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, invalid token",
        });
    }
};

// Role-Based Authorization
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message:
                    "Access denied. You do not have permission.",
            });
        }

        next();
    };
    //
};