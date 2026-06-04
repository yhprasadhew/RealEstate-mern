import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MongoDB connection failed: MONGO_URI is not defined in your environment.");
    console.error("Please add MONGO_URI to backend/.env or your runtime environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);

    console.log("MongoDB connected successfully ✅");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};