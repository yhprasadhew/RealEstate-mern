import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HiOutlineLibrary,
  HiOutlineCheckCircle,
  HiOutlineCreditCard,
  HiOutlineEye,
  HiOutlineChatAlt2,
  HiOutlineSearch,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencilAlt,
  HiOutlineEye as HiEyeIcon
} from "react-icons/hi";

import { api } from "../../context/AuthContext";
import { sellerDashboardStyles as s, myPropertiesStyles as m } from "../../assets/dummyStyles";

const SellerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMyPropertiesOnly = location.pathname === "/my-properties";

  const [stats, setStats] = useState({
    totalProperties: 0,
    activeListings: 0,
    soldProperties: 0,
    totalInquiries: 0,
    totalViews: 0
  });

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch seller stats
      const statsRes = await api.get("/api/property/seller/dashboard");
      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      // Fetch seller properties
      const propsRes = await api.get("/api/property/my");
      if (propsRes.data.success) {
        setProperties(propsRes.data.properties);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle marking a property as sale or sold
  const handleToggleStatus = async (propertyId, currentStatus) => {
    const newStatus = currentStatus === "sale" ? "sold" : "sale";
    try {
      const res = await api.patch(`/api/property/${propertyId}/status`, { status: newStatus });
      if (res.data.success) {
        // Update local property state
        setProperties((prev) =>
          prev.map((prop) =>
            prop._id === propertyId ? { ...prop, status: newStatus } : prop
          )
        );
        // Refresh stats
        const statsRes = await api.get("/api/property/seller/dashboard");
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update property status.");
    }
  };

  // Handle deleting a property
  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property listing? This action cannot be undone.")) return;

    try {
      const res = await api.delete(`/api/property/${propertyId}`);
      if (res.data.success) {
        setProperties((prev) => prev.filter((prop) => prop._id !== propertyId));
        // Refresh stats
        const statsRes = await api.get("/api/property/seller/dashboard");
        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete property.");
    }
  };

  // Filter properties by search term
  const filteredProperties = properties.filter((prop) =>
    prop.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && properties.length === 0) {
    return (
      <div className={m.loaderFullPage}>
        <div className={m.loader}></div>
      </div>
    );
  }

  return (
    <div className="fade-in max-w-7xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className={s.header}>
        <div className={s.headerLeft}>
          <h1 className={s.headerTitle}>{isMyPropertiesOnly ? "My Listings" : "Seller Overview"}</h1>
          <p className={s.headerSubtitle}>
            {isMyPropertiesOnly 
              ? "Manage and edit your listed properties" 
              : "Monitor your real estate performance and listings"}
          </p>
        </div>
        <div className={s.headerActions}>
          <Link to="/dashboard/create-listing" className={s.addButton}>
            <HiOutlinePlus size={20} />
            <span>Create Listing</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchData} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
      {!isMyPropertiesOnly && (
        <div className={s.statsGrid}>
        {/* Total Properties */}
        <div className={s.statCard}>
          <div className={s.statIconWrapper}>
            <HiOutlineLibrary size={20} className="text-primary" />
          </div>
          <p className={s.statTitle}>Total Listings</p>
          <h2 className={s.statValue}>{stats.totalProperties}</h2>
        </div>

        {/* Active Listings */}
        <div className={s.statCard}>
          <div className={s.statIconWrapper}>
            <HiOutlineCheckCircle size={20} className="text-[#10b981]" />
          </div>
          <p className={s.statTitle}>Active Listings</p>
          <h2 className={s.statValue}>{stats.activeListings}</h2>
        </div>

        {/* Sold Properties */}
        <div className={s.statCard}>
          <div className={s.statIconWrapper}>
            <HiOutlineCreditCard size={20} className="text-[#3b82f6]" />
          </div>
          <p className={s.statTitle}>Sold Properties</p>
          <h2 className={s.statValue}>{stats.soldProperties}</h2>
        </div>

        {/* Total Views */}
        <div className={s.statCard}>
          <div className={s.statIconWrapper}>
            <HiOutlineEye size={20} className="text-[#8b5cf6]" />
          </div>
          <p className={s.statTitle}>Total Views</p>
          <h2 className={s.statValue}>{stats.totalViews}</h2>
        </div>

        {/* Total Inquiries */}
        <div className={s.statCard}>
          <div className={s.statIconWrapper}>
            <HiOutlineChatAlt2 size={20} className="text-[#f59e0b]" />
          </div>
          <p className={s.statTitle}>Total Inquiries</p>
          <h2 className={s.statValue}>{stats.totalInquiries}</h2>
        </div>
      </div>
      )}

      {/* Listings Section */}
      <div className={s.listingsSection}>
        <div className={s.listingsHeader}>
          <h2 className={s.listingsTitle}>My Properties ({filteredProperties.length})</h2>
          
          <div className={s.searchWrapper}>
            <HiOutlineSearch size={18} className={s.searchIcon} />
            <input
              type="text"
              placeholder="Search listings..."
              className={s.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredProperties.length === 0 ? (
          <div className={m.emptyCard}>
            <div className={m.emptyIconWrapper}>
              <HiOutlineLibrary size={36} className="text-[#94a3b8]" />
            </div>
            <h3 className={m.emptyTitle}>No Listings Found</h3>
            <p className={m.emptyText}>
              {searchTerm ? "No properties match your search criteria." : "You haven't listed any properties yet."}
            </p>
            {!searchTerm && (
              <Link to="/dashboard/create-listing" className={m.emptyButton}>
                Add Your First Property
              </Link>
            )}
          </div>
        ) : (
          <div className={s.propertiesGrid}>
            {filteredProperties.map((prop) => (
              <div
                key={prop._id}
                className="bg-white rounded-3xl overflow-hidden border border-[#f1f5f9] shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] w-full max-w-[360px] flex flex-col h-full"
              >
                {/* Image & Status Badge */}
                <div className="relative h-48 bg-gray-100 overflow-hidden shrink-0">
                  <img
                    src={prop.images?.[0] || "https://via.placeholder.com/400x300?text=No+Image"}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  <span
                    className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      prop.status === "sale"
                        ? "bg-[#dcfce7] text-[#166534]"
                        : "bg-[#fee2e2] text-[#991b1b]"
                    }`}
                  >
                    For {prop.status === "sale" ? "Sale" : "Sold"}
                  </span>
                </div>

                {/* Details */}
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-primary font-bold text-xs uppercase tracking-wider mb-1">
                    {prop.propertyType}
                  </span>
                  <h3 className="font-extrabold text-[#1e293b] text-base mb-2 line-clamp-1">
                    {prop.title}
                  </h3>
                  <p className="text-[#64748b] text-xs mb-4">
                    {prop.area}, {prop.city}
                  </p>

                  <div className="flex justify-between items-center mb-6 pt-3 border-t border-dashed border-[#f1f5f9] mt-auto">
                    <span className="font-black text-primary text-lg">
                      ₹{prop.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[#64748b] text-xs flex items-center gap-1">
                      <HiOutlineEye size={16} />
                      {prop.views} views
                    </span>
                  </div>

                  {/* Actions */}
                  <div className={s.propertyActions}>
                    <button
                      onClick={() => handleToggleStatus(prop._id, prop.status)}
                      className={s.statusButton(prop.status)}
                      title={prop.status === "sale" ? "Mark as Sold" : "Mark as Active"}
                    >
                      {prop.status === "sale" ? "Mark Sold" : "Make Active"}
                    </button>
                    
                    <button
                      onClick={() => navigate(`/dashboard/edit-listing/${prop._id}`)}
                      className={s.editButton}
                      title="Edit Property"
                    >
                      <HiOutlinePencilAlt size={16} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDeleteProperty(prop._id)}
                      className={s.deleteButton}
                      title="Delete Property"
                    >
                      <HiOutlineTrash size={16} />
                      <span>Delete</span>
                    </button>

                    <Link
                      to={`/properties/${prop._id}`}
                      className={s.viewButton}
                      title="View Details"
                    >
                      <HiEyeIcon size={16} className="text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
