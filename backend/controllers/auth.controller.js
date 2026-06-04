import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import SendEmail from "../utils/sendEmail.js";

// REGISTER USER
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: "All fields are required",
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase(),
        });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const verificationToken = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            phone,
            verificationToken,
            isApproved: role === "seller" ? false : true,
        });

        await SendEmail({
            email: user.email,
            subject: "Email Verification - Real Estate App",
            message: `
                <h2>Email Verification</h2>
                <p>Hello ${user.name},</p>
                <p>Your verification code is:</p>
                <h1>${verificationToken}</h1>
            `,
        });

        res.status(201).json({
            success: true,
            message:
                "User registered successfully. Please verify your email.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                message: "Email and verification code are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "Email already verified",
            });
        }

        if (user.verificationToken !== code) {
            return res.status(400).json({
                message: "Invalid verification code",
            });
        }

        user.isVerified = true;
        user.verificationToken = "";

        await user.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// LOGIN USER
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                message: "Your account has been blocked",
            });
        }

        if (!user.isApproved) {
            return res.status(403).json({
                message: "Account pending admin approval",
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email first",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET USER PROFILE
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const resetCode = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        user.resetPasswordToken = resetCode;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

        await user.save();

        await SendEmail({
            email: user.email,
            subject: "Password Reset",
            message: `
                <h2>Password Reset</h2>
                <p>Your password reset code is:</p>
                <h1>${resetCode}</h1>
                <p>This code expires in 10 minutes.</p>
            `,
        });

        res.status(200).json({
            success: true,
            message: "Password reset code sent",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
    try {
        const { email, code, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        if (
            user.resetPasswordToken !== code ||
            user.resetPasswordExpires < Date.now()
        ) {
            return res.status(400).json({
                message: "Invalid or expired reset code",
            });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = "";
        user.resetPasswordExpires = null;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};