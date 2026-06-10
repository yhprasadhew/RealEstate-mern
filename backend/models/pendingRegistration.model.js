import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: "buyer",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    verificationToken: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => Date.now() + 24 * 60 * 60 * 1000,
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

const PendingRegistration = mongoose.model(
  "PendingRegistration",
  pendingRegistrationSchema
);

export default PendingRegistration;
