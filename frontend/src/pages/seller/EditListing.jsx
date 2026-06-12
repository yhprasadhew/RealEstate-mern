import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const EditListing = () => {
  const { id } = useParams();
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
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchProperty = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get(`/api/property/${id}`);
      if (res.data.success) {
        const prop = res.data.property;
        
        setFormData({
          title: prop.title || "",
          description: prop.description || "",
          price: prop.price || "",
          propertyType: prop.propertyType || "apartment",
          status: prop.status || "sale",
          city: prop.city || "",
          area: prop.area || "",
          pincode: prop.pincode || "",
          bhk: prop.bhk || "",
          bathrooms: prop.bathrooms !== undefined ? prop.bathrooms : "",
          areaSize: prop.areaSize !== undefined ? prop.areaSize : "",
          furnishing: prop.furnishing || "unfurnished"
        });

        setFacilities(prop.facilities || []);
        setExistingImages(prop.images || []);
      } else {
        setError("Failed to fetch property details.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error fetching property details.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProperty();
  }, [fetchProperty]);

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
    if (existingImages.length + newImages.length + files.length > 10) {
      alert("You can upload a maximum of 10 images.");
      return;
    }

    const updatedNewImages = [...newImages, ...files];
    setNewImages(updatedNewImages);

    // Create file object URLs for previewing
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  // Remove existing image
  const handleRemoveExistingImage = (imgUrl) => {
    setExistingImages((prev) => prev.filter((img) => img !== imgUrl));
  };

  // Remove a selected new image
  const handleRemoveNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    // Clean up object URL memory leak
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    // Validation
    if (existingImages.length === 0 && newImages.length === 0) {
      setError("Please retain or upload at least one image of the property.");
      setIsSaving(false);
      return;
    }

    const uploadData = new FormData();
    // Append standard fields
    Object.keys(formData).forEach((key) => {
      uploadData.append(key, formData[key]);
    });

    // Append facilities
    uploadData.append("facilities", JSON.stringify(facilities));

    // Append remaining existing images
    uploadData.append("existingImages", JSON.stringify(existingImages));

    // Append new image files
    newImages.forEach((file) => {
      uploadData.append("images", file);
    });

    try {
      const res = await api.put(`/api/property/${id}`, uploadData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data.success) {
        navigate("/dashboard");
      } else {
        setError(res.data.message || "Failed to update listing.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Internal server error while updating listing.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

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
          <h1 className={s.pageTitle}>Edit Property Listing</h1>
          <p className={s.pageSubtitle}>Modify details and images of your property</p>
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
                  <label className={s.label}>Price (in INR) *</label>
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
                    placeholder="e.g. Mumbai"
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
                    placeholder="e.g. Bandra West"
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

          {/* SECTION 5: Photos */}
          <div className={s.section}>
            <div className={s.sectionHeader}>
              <span className={s.sectionIndicator} />
              <h2 className={s.sectionTitle}>Property Photos</h2>
            </div>

            <div className={s.sectionContent}>
              {/* Existing Photos */}
              {existingImages.length > 0 && (
                <div>
                  <label className={s.label}>Existing Photos</label>
                  <div className={s.imageGrid + " mb-8"}>
                    {existingImages.map((imgUrl, idx) => (
                      <div key={`existing-${idx}`} className={s.imageCard}>
                        <img
                          src={imgUrl}
                          alt="Existing Property"
                          className={s.imageCardImg}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveExistingImage(imgUrl)}
                          className={s.removeImageBtn}
                        >
                          <HiX size={14} />
                        </button>
                        <span className={s.imageBadgeExisting}>EXISTING</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  <p className="font-bold text-[#1e293b] mb-1">Click to upload more photos</p>
                  <p className="text-xs text-[#64748b]">Upload up to 10 JPG or PNG photos total</p>
                </div>
              </div>

              {/* New Photos Previews */}
              {newImagePreviews.length > 0 && (
                <div>
                  <label className={s.label + " mt-6"}>New Photos to Upload</label>
                  <div className={s.imageGrid}>
                    {newImagePreviews.map((preview, index) => (
                      <div key={`new-${index}`} className={s.imageCardNew}>
                        <img
                          src={preview}
                          alt={`New Preview ${index + 1}`}
                          className={s.imageCardImg}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveNewImage(index)}
                          className={s.removeImageBtn}
                        >
                          <HiX size={14} />
                        </button>
                        <span className={s.imageBadgeNew}>NEW</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className={s.formActions}>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              disabled={isSaving}
              className={s.cancelButton}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className={s.submitButton}
            >
              {isSaving ? "Saving Updates..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;
