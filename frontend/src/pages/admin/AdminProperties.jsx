import React, { useEffect, useState, useCallback } from "react";
import { HiOutlineTrash, HiOutlineEye, HiOutlineRefresh } from "react-icons/hi";
import { Link } from "react-router-dom";
import { api } from "../../context/AuthContext";
import { adminPropertiesStyles as s } from "../../assets/dummyStyles";
import PropertyCard from "../../components/common/PropertyCard";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/properties");
      if (res.data.success) {
        setProperties(res.data.properties);
      } else {
        setError("Failed to fetch property listings");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error retrieving properties");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property? This will remove all images from Cloudinary storage. This action is irreversible.")) return;

    try {
      const res = await api.delete(`/api/admin/properties/${propertyId}`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((p) => p._id !== propertyId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property listing");
    }
  };

  const renderAdminActions = (property) => {
    const seller = property.seller || {};
    return (
      <div 
        className={s.actionWrapper}
        onClick={(e) => {
          // Prevent PropertyCard Link component from executing navigation when clicking the actions section
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className={s.sellerInfo}>
          <div className={s.sellerName}>Seller: {seller.name || "Unknown"}</div>
          <div className={s.sellerEmail}>{seller.email || "No email"}</div>
        </div>
        <div className={s.buttonGroup}>
          <Link to={`/properties/${property._id}`} className={s.viewLink} title="View Details">
            <HiOutlineEye size={16} />
          </Link>
          <button
            onClick={() => handleDeleteProperty(property._id)}
            className={s.deleteButton}
            title="Moderate Listing (Delete)"
          >
            <HiOutlineTrash size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading && properties.length === 0) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.headerContainer + " flex justify-between items-center"}>
        <div>
          <h1 className={s.pageTitle}>Manage Listings</h1>
          <p className={s.pageSubtitle}>Moderate and monitor properties published on the platform</p>
        </div>
        <button onClick={fetchProperties} className="btn btn-outline py-2.5 px-4 bg-white" disabled={loading}>
          <HiOutlineRefresh size={18} className={`inline mr-1 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchProperties} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {properties.length === 0 ? (
        <div className={s.emptyStateCard}>
          No property listings exist currently on the platform.
        </div>
      ) : (
        <div className={s.propertiesGrid}>
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              renderActions={renderAdminActions}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminProperties;
