import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { HiOutlineAdjustments, HiViewGrid, HiViewList } from "react-icons/hi";

// Internal Infrastructure Imports
import { propertiesStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import API_URL from "../../config";

const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();

  // ── Core States ────────────────────────────────────────────────────────
  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ── Filter Framework States ─────────────────────────────────────────────
  const [filters, setFilters] = useState({
    city: "",
    propertyType: [],
    bhk: "",
    maxPrice: 100000000,
    amenities: [],
    furnishing: [],
    sort: "latest",
  });

  const propertyTypes = [
    { label: "Flat/Apartment", value: "flat" },
    { label: "Independent House/Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];

  // ── Helper: Sync state changes back to URL query parameters ────────────
  const updateURLParams = (updatedFilters) => {
    const params = new URLSearchParams();
    if (updatedFilters.city) params.append("city", updatedFilters.city);
    if (updatedFilters.propertyType.length > 0) {
      params.append("type", updatedFilters.propertyType[0]); // Handle first matching selection
    }
    if (updatedFilters.bhk) params.append("bhk", updatedFilters.bhk);

    const search = params.toString() ? `?${params.toString()}` : "";
    navigate({ pathname: location.pathname, search }, { replace: true });
  };

  // ── 1. Fetch Master Database Listings ───────────────────────────────────
  const fetchProperties = useCallback(async (currentFilters) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (currentFilters.city) params.append("city", currentFilters.city);
      if (currentFilters.bhk) params.append("bhk", currentFilters.bhk);
      if (currentFilters.maxPrice) params.append("maxPrice", currentFilters.maxPrice);
      if (currentFilters.sort) params.append("sort", currentFilters.sort);

      if (currentFilters.propertyType.length > 0) {
        params.append("propertyType", currentFilters.propertyType.join(","));
      }
      if (currentFilters.furnishing.length > 0) {
        params.append("furnishing", currentFilters.furnishing.join(","));
      }

      const res = await axios.get(`${API_URL}/api/property?${params.toString()}`);
      setProperties(res.data?.properties ?? []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to sync property listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  // ── 2. Fetch User Wishlist ─────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const validIds = res.data
        .filter((item) => item && item.property)
        .map((item) => String(item.property._id || item.property));
      setWishlistedIds(validIds);
    } catch (error) {
      console.error("Wishlist data syncing failure", error);
    }
  }, [token]);

  // ── 3. Toggle Wishlist Endpoint Handler ─────────────────────────────────
  const handleToggleWishlist = async (id) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      setWishlistedIds((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
      
      await axios.post(
        `${API_URL}/api/wishlist/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      fetchWishlist(); // Fallback on network failure
    }
  };

  // ── 4. URL State Synchronization Hook (Loop-Free) ──────────────────────
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const city = queryParams.get("city") || "";
    const type = queryParams.get("type") || "";
    const bhk = queryParams.get("bhk") || "";

    const nextFilters = {
      city,
      propertyType: type ? [type] : [],
      bhk,
      // preserve other defaults from initial state
      maxPrice: 100000000,
      amenities: [],
      furnishing: [],
      sort: "latest",
    };

    // Defer filter state update to avoid synchronous setState inside effect
    setTimeout(() => setFilters(nextFilters), 0);
    fetchProperties(nextFilters);

    if (user) {
      fetchWishlist();
    }
  }, [location.search, user, fetchProperties, fetchWishlist]);

  return (
    <div className={s.pageContainer || "min-h-screen bg-slate-50"}>
      <Navbar />

      <div className={s.container || "max-w-7xl mx-auto px-4 py-8"}>
        
        {/* Mobile View Toggle Controls Header */}
        <div className={s.mobileFilterButtonWrapper || "flex items-center justify-between mb-6 lg:hidden"}>
          <button
            onClick={() => setShowMobileFilters(true)}
            className={s.mobileFilterButton || "flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 shadow-sm"}
          >
            <HiOutlineAdjustments size={18} />
            <span>Filters</span>
          </button>

          <div className="flex bg-slate-200/60 p-1 rounded-xl items-center">
            <button 
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
            >
              <HiViewGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "list" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
            >
              <HiViewList size={18} />
            </button>
          </div>
        </div>

        {/* Main Display Container */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Filter Dashboard Sidebar Panel */}
          <aside className={`w-full lg:w-64 shrink-0 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm h-fit sticky top-24 ${showMobileFilters ? "fixed inset-0 z-50 overflow-y-auto block" : "hidden lg:block"}`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-extrabold text-slate-900 text-base">Filter Properties</h3>
              {showMobileFilters && (
                <button onClick={() => setShowMobileFilters(false)} className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Done
                </button>
              )}
            </div>

            {/* Location Input Filter */}
            <div className="mb-5">
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Location/City</label>
              <input
                type="text"
                value={filters.city}
                onChange={(e) => {
                  const updated = { ...filters, city: e.target.value };
                  setFilters(updated);
                  updateURLParams(updated);
                }}
                placeholder="e.g. Wellawatte"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 text-slate-800"
              />
            </div>

            {/* Property Checkboxes Layout Filter */}
            <div className="mb-5">
              <label className="block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Property Type</label>
              <div className="flex flex-col gap-2">
                {propertyTypes.map((t) => (
                  <label key={t.value} className="flex items-center gap-2.5 text-sm font-medium text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.propertyType.includes(t.value)}
                      onChange={(e) => {
                        const nextTypes = e.target.checked
                          ? [...filters.propertyType, t.value]
                          : filters.propertyType.filter((x) => x !== t.value);
                        const updated = { ...filters, propertyType: nextTypes };
                        setFilters(updated);
                        updateURLParams(updated);
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/20 w-4 h-4"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Core Results Active Grid Area */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl h-96 border border-slate-100 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <p className="text-red-500 font-semibold text-sm">{error}</p>
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <h4 className="font-bold text-slate-800 mb-1">No Listings Found</h4>
                <p className="text-slate-400 text-xs">Try loosening your search filter fields above.</p>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-6"}>
                {properties.map((property) => (
                  <PropertyCard
                    key={property._id}
                    property={property}
                    isWishlisted={wishlistedIds.includes(String(property._id))}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Properties;