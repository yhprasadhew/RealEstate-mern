import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import cloudinary from "../config/cloudinary.js";

// =======================
// GET ALL USERS
// =======================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// BLOCK USER
// =======================
export const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User blocked successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// UNBLOCK USER
// =======================
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isBlocked = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User unblocked successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// DELETE USER
// =======================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch seller properties to clear assets from Cloudinary before wiping documents
    const properties = await Property.find({ seller: user._id });
    for (const property of properties) {
      for (const imageUrl of property.images) {
        try {
          const publicId = imageUrl.split("/").pop().split(".")[0];
          await cloudinary.uploader.destroy(`properties/${publicId}`);
        } catch (err) {
          console.error("Cloudinary asset deletion failed during user wipe:", err.message);
        }
      }
    }

    // Delete user's properties documents
    await Property.deleteMany({ seller: user._id });

    // Delete user's inquiries
    await Inquiry.deleteMany({
      $or: [{ buyer: user._id }, { seller: user._id }],
    });

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET ALL PROPERTIES
// =======================
export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await Property.find()
      .populate("seller", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      properties,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// DELETE PROPERTY
// =======================
export const deletePropertyAdmin = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Clean up images inside Cloudinary bucket to protect storage limits
    for (const imageUrl of property.images) {
      try {
        const publicId = imageUrl.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`properties/${publicId}`);
      } catch (err) {
        console.error("Cloudinary asset deletion failed during admin forced remove:", err.message);
      }
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================
// GET ALL INQUIRIES
// =======================
export const getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find()
      .populate("buyer", "name email phone")
      .populate("seller", "name email phone")
      .populate("property", "title price city images")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inquiries.length,
      inquiries,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// DASHBOARD STATS
// =======================
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await Property.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    const buyers = await User.countDocuments({ role: "buyer" });
    const sellers = await User.countDocuments({ role: "seller" });
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    const soldProperties = await Property.countDocuments({ status: "sold" });
    const availableProperties = await Property.countDocuments({ status: "sale" });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalInquiries,
        buyers,
        sellers,
        blockedUsers,
        soldProperties,
        availableProperties,
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Get pending seller accounts
export const getPendingSellers = async (req, res) => {
  try {
    const sellers = await User.find({
      role: "seller",
      isApproved : false ,
    }).select("-password");

    res.status(200).json({
      success: true,
      count: sellers.length,
      sellers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Approve seller account
export const approveSeller = async (req, res) => {
  try {
    const seller = await User.findById(req.params.id);

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Seller not found",
      });
    }

    if (seller.role !== "seller") {
      return res.status(400).json({
        success: false,
        message: "User is not a seller",
      });
    }

    seller.isApproved  = true ;
    await seller.save();

    res.status(200).json({
      success: true,
      message: "Seller approved successfully",
      seller,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};