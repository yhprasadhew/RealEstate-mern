import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";
import cloudinary from "../config/cloudinary.js";

// Add Property
export const addProperty = async (req, res) => {
  try {
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "properties"
        );

        imageUrls.push(result.secure_url);
      }
    }

    const property = await Property.create({
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      city: req.body.city,
      area: req.body.area,
      pincode: req.body.pincode,
      propertyType: req.body.propertyType,
      bhk: req.body.bhk ? String(req.body.bhk) : undefined,
      bathrooms: req.body.bathrooms
        ? Number(req.body.bathrooms)
        : undefined,
      areaSize: req.body.areaSize
        ? Number(req.body.areaSize)
        : undefined,
      furnishing: req.body.furnishing,
      status: req.body.status,
      images: imageUrls,
      seller: req.user._id,

      facilities: req.body.facilities
        ? Array.isArray(req.body.facilities)
          ? req.body.facilities
          : (() => {
              try {
                return JSON.parse(req.body.facilities);
              } catch (e) {
                return req.body.facilities.split(",");
              }
            })()
        : [],
    });

    res.status(201).json({
      success: true,
      property,
    });
  } catch (error) {
    console.error("ADD_PROPERTY_ERROR:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal server error while adding property",
    });
  }
};

// Get My Properties
export const getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({
      seller: req.user._id,
    });

    res.status(200).json({
      success: true,
      properties,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Property
export const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const fields = [
      "title",
      "description",
      "price",
      "city",
      "area",
      "pincode",
      "propertyType",
      "bhk",
      "bathrooms",
      "areaSize",
      "furnishing",
      "status",
      "facilities",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (
          field === "facilities" &&
          typeof req.body[field] === "string"
        ) {
          try {
            property[field] = JSON.parse(req.body[field]);
          } catch (e) {
            property[field] = req.body[field].split(",");
          }
        } else {
          property[field] = req.body[field];
        }
      }
    });

    if (req.body.existingImages) {
      try {
        const existing = JSON.parse(
          req.body.existingImages
        );

        property.images = Array.isArray(existing)
          ? existing
          : property.images;
      } catch (e) {
        console.error(
          "Failed to parse existingImages:",
          e
        );
      }
    }

    if (req.files && req.files.length > 0) {
      let newImages = [];

      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "properties"
        );

        newImages.push(result.secure_url);
      }

      property.images = [
        ...property.images,
        ...newImages,
      ];
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Property
export const deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of property.images) {
      try {
        const publicId =
          imageUrl.split("/").pop().split(".")[0];

        await cloudinary.uploader.destroy(
          `properties/${publicId}`
        );
      } catch (err) {
        console.error(
          "Cloudinary delete error:",
          err.message
        );
      }
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: "Property deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Property Status
export const updatePropertyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Check ownership
    if (
      property.seller.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Validate status
    if (!["sale", "sold"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use 'sale' or 'sold'",
      });
    }

    property.status = status;

    await property.save();

    res.status(200).json({
      success: true,
      message: `Property marked as ${status}`,
      property,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};