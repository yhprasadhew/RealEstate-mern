import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiX, HiArrowLeft } from "react-icons/hi";
import { HiOutlineUpload } from "react-icons/hi";

import { api } from "../../context/AuthContext";
import { editPropertyStyles as s } from "../../assets/dummyStyles";

const PROPERTY_TYPES = [
  "flat", "apartment", "villa", "house", "studio", 
  "penthouse", "office", "townhouse", "plot", "commercial"
];

const FURNISHING_TYPES = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi-furnished", label: "Semi-Furnished" },
  { value: "furnished", label: "Furnished" }
];

const AVAILABLE_FACILITIES = [
  "Parking", "Pool", "Gym", "Wifi", "Elevator", 
  "Security", "Balcony", "Garden", "Clubhouse", "Playground"
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    propertyType: "apartment",
    status: "sale",
    city: "",
    area: "",
    pincode: "",
    bhk: "",
    bathrooms: "",
    areaSize: "",
    furnishing: "unfurnished"
  });

  const [facilities, setFacilities] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle standard input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle facilities check/uncheck
  const handleFacilityToggle = (facility) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility]
    );
  };

  // Handle image files selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create file object URLs for previewing
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove a selected image
  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    // Clean up object URL memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validation
    if (images.length === 0) {
      setError("Please upload at least one image of the property.");
      setIsLoading(false);
      return;
    }

    const uploadData = new FormData();
    // Append standard fields
    Object.keys(formData).forEach((key) => {
      uploadData.append(key, formData[key]);
    });

    // Append facilities
    uploadData.append("facilities", JSON.stringify(facilities));

    // Append image files
    images.forEach((file) => {
      uploadData.append("images", file);
    });

    try {
      const res = await api.post("/api/property", uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Failed to create listing.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Internal server error while creating listing.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <div className={s.innerContainer}>
        {/* Back navigation */}
        <button
          onClick={() => navigate("/dashboard")}
          className="mb-6 flex items-center gap-2 text-[#64748b] hover:text-[#1e293b] font-bold border-none bg-transparent cursor-pointer"
        >
          <HiArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div className={s.headerWrapper}>
          <h1 className={s.pageTitle}>Create Property Listing</h1>
          <p className={s.pageSubtitle}>List your real estate asset for sale or rent</p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-100 text-red-600 rounded-2xl border border-red-200 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={s.formContainer}>
          {/* SECTION 1: Basic Information */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Basic Information</h2>
            </div>
            
            <div className={s.sectionContent}>
              <div>
                <label className={s.label}>Property Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Luxurious 3 BHK Apartment in Bandra"
                  required
                  className={s.input}
                />
              </div>

              <div>
                <label className={s.label}>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your property detailed features, landmarks, advantages, etc."
                  required
                  className={s.textarea}
                />
              </div>

              <div className={s.twoColumnGrid}>
                <div>
                  <label className={s.label}>Price (in LKR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="e.g. 15000000"
                    required
                    min="1"
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Property Type *</label>
                  <select
                    name="propertyType"
                    value={formData.propertyType}
                    onChange={handleChange}
                    className={s.select}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: Location Details */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Location Details</h2>
            </div>

            <div className={s.sectionContent}>
              <div className={s.threeColumnGrid}>
                <div>
                  <label className={s.label}>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Colombo"
                    required
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Area / Locality *</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    placeholder="e.g. colombo:-01"
                    required
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 400050"
                    required
                    className={s.input}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Additional Features */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Additional Specifications</h2>
            </div>

            <div className={s.sectionContent}>
              <div className={s.threeColumnGrid}>
                <div>
                  <label className={s.label}>BHK / Bedrooms</label>
                  <input
                    type="text"
                    name="bhk"
                    value={formData.bhk}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Bathrooms</label>
                  <input
                    type="number"
                    name="bathrooms"
                    value={formData.bathrooms}
                    onChange={handleChange}
                    placeholder="e.g. 3"
                    min="0"
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Area Size (in sq ft)</label>
                  <input
                    type="number"
                    name="areaSize"
                    value={formData.areaSize}
                    onChange={handleChange}
                    placeholder="e.g. 1500"
                    min="1"
                    className={s.input}
                  />
                </div>
              </div>

              <div>
                <label className={s.label}>Furnishing Status</label>
                <div className="flex gap-4">
                  {FURNISHING_TYPES.map((type) => (
                    <label
                      key={type.value}
                      className={`flex-1 cursor-pointer p-3.5 rounded-xl border text-center font-semibold text-sm transition-all duration-200 ${
                        formData.furnishing === type.value
                          ? "bg-primary-light border-primary text-primary-dark"
                          : "bg-[#f8fafc] border-[#e2e8f0] text-text-main hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="furnishing"
                        value={type.value}
                        checked={formData.furnishing === type.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      {type.label}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Facilities */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Amenities & Facilities</h2>
            </div>

            <div className={s.sectionContent}>
              <div className={s.amenitiesGrid}>
                {AVAILABLE_FACILITIES.map((facility) => {
                  const isSelected = facilities.includes(facility);
                  return (
                    <label
                      key={facility}
                      className={s.amenityLabel(isSelected)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFacilityToggle(facility)}
                        className={s.amenityCheckbox}
                      />
                      <span className={s.amenityText(isSelected)}>
                        {facility}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 5: Upload Photos */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Property Photos</h2>
            </div>

            <div className={s.sectionContent}>
              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-[#cbd5e1] p-10 rounded-2xl text-center cursor-pointer relative bg-[#f8fafc] transition-colors hover:border-primary">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <HiOutlineUpload size={36} className="text-[#64748b] mb-3" />
                  <p className="font-bold text-[#1e293b] mb-1">Click to upload photos</p>
                  <p className="text-xs text-[#64748b]">Upload up to 10 JPG or PNG photos</p>
                </div>
              </div>

              {/* Photos Previews */}
              {imagePreviews.length > 0 && (
                <div className={s.imageGrid}>
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className={s.imageCard}>
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className={s.imageCardImg}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className={s.removeImageBtn}
                      >
                        <HiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className={s.formActions}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={isLoading}
              className={s.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className={s.submitButton}
            >
              {isLoading ? "Listing Property..." : "Submit Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListing;
