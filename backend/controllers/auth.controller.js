import User from "../models/user.model.js";
import PendingRegistration from "../models/pendingRegistration.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SendEmail from "../utils/sendEmail.js";

const generateVerificationToken = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (recipientEmail, name, verificationToken) => {
    await SendEmail({
        email: recipientEmail,
        subject: "Email Verification - Real Estate App",
        message: `
            <h2>Email Verification</h2>
            <p>Hello ${name},</p>
            <p>Your verification code is:</p>
            <h1>${verificationToken}</h1>
            <p>This code expires in 24 hours.</p>
        `,
    });
};

const logDevVerificationCode = (recipientEmail, verificationToken) => {
    if (process.env.NODE_ENV !== "production") {
        console.log(
            `[DEV] Verification code for ${recipientEmail}: ${verificationToken}`
        );
    }
};

// REGISTER USER (stores pending registration until OTP is verified)
export const registerUser = async (req, res) => {
    try {
        const { name, email, password, role, phone } = req.body;

        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const verifiedUser = await User.findOne({
            email: normalizedEmail,
            isVerified: true,
        });

        if (verifiedUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();

        await PendingRegistration.findOneAndUpdate(
            { email: normalizedEmail },
            {
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role,
                phone,
                verificationToken,
                expiresAt: Date.now() + 24 * 60 * 60 * 1000,
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        let emailSent = true;

        try {
            await sendVerificationEmail(
                normalizedEmail,
                name,
                verificationToken
            );
        } catch (emailError) {
            emailSent = false;
            console.error("Verification email failed:", emailError.message);
            logDevVerificationCode(normalizedEmail, verificationToken);
        }

        res.status(201).json({
            success: true,
            emailSent,
            message: emailSent
                ? "Verification code sent. Please verify your email to complete registration."
                : "Could not send verification email. Use resend code or check the backend console in development.",
            user: {
                name,
                email: normalizedEmail,
                role,
                phone,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// VERIFY EMAIL (creates user only after valid OTP)
export const verifyEmail = async (req, res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                success: false,
                message: "Email and verification code are required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const normalizedCode = String(code).trim();

        const pending = await PendingRegistration.findOne({
            email: normalizedEmail,
        });

        if (pending) {
            if (pending.verificationToken !== normalizedCode) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid verification code",
                });
            }

            const existingUser = await User.findOne({ email: normalizedEmail });

            if (existingUser?.isVerified) {
                await PendingRegistration.deleteOne({ _id: pending._id });
                return res.status(400).json({
                    success: false,
                    message: "Email already verified. Please log in.",
                });
            }

            if (existingUser) {
                await User.deleteOne({ _id: existingUser._id });
            }

            await User.create({
                name: pending.name,
                email: pending.email,
                password: pending.password,
                role: pending.role,
                phone: pending.phone,
                isVerified: true,
                isApproved: pending.role === "seller" ? false : true,
            });

            await PendingRegistration.deleteOne({ _id: pending._id });

            return res.status(200).json({
                success: true,
                message: "Email verified successfully. You can now log in.",
            });
        }

        const legacyUser = await User.findOne({ email: normalizedEmail });

        if (!legacyUser) {
            return res.status(404).json({
                success: false,
                message: "No pending registration found for this email",
            });
        }

        if (legacyUser.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email already verified. Please log in.",
            });
        }

        if (legacyUser.verificationToken !== normalizedCode) {
            return res.status(400).json({
                success: false,
                message: "Invalid verification code",
            });
        }

        legacyUser.isVerified = true;
        legacyUser.verificationToken = "";
        await legacyUser.save();

        res.status(200).json({
            success: true,
            message: "Email verified successfully. You can now log in.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// RESEND VERIFICATION CODE
export const resendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const verificationToken = generateVerificationToken();

        const pending = await PendingRegistration.findOne({
            email: normalizedEmail,
        });

        if (pending) {
            pending.verificationToken = verificationToken;
            pending.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
            await pending.save();

            let emailSent = true;

            try {
                await sendVerificationEmail(
                    pending.email,
                    pending.name,
                    verificationToken
                );
            } catch (emailError) {
                emailSent = false;
                console.error("Resend verification email failed:", emailError.message);
                logDevVerificationCode(pending.email, verificationToken);
            }

            return res.status(200).json({
                success: true,
                emailSent,
                message: emailSent
                    ? "A new verification code has been sent."
                    : "Could not send email. Check the backend console in development.",
            });
        }

        const legacyUser = await User.findOne({
            email: normalizedEmail,
            isVerified: false,
        });

        if (!legacyUser) {
            return res.status(404).json({
                success: false,
                message: "No pending registration found for this email",
            });
        }

        legacyUser.verificationToken = verificationToken;

        let emailSent = true;

        try {
            await sendVerificationEmail(
                legacyUser.email,
                legacyUser.name,
                verificationToken
            );
            await legacyUser.save();
        } catch (emailError) {
            emailSent = false;
            console.error("Resend verification email failed:", emailError.message);
            logDevVerificationCode(legacyUser.email, verificationToken);
            await legacyUser.save();
        }

        res.status(200).json({
            success: true,
            emailSent,
            message: emailSent
                ? "A new verification code has been sent."
                : "Could not send email. Check the backend console in development.",
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

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            const pending = await PendingRegistration.findOne({
                email: normalizedEmail,
            });

            if (pending) {
                return res.status(403).json({
                    message:
                        "Please verify your email to complete registration",
                });
            }

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