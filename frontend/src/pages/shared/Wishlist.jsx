import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiHeart, HiOutlineTrash, HiOutlineHeart } from "react-icons/hi";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import { useAuth, api } from "../../context/AuthContext";
import { wishlistStyles as s } from "../../assets/dummyStyles";

const Wishlist = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/wishlist");
      if (res.data.success) {
        // Under populate("property"), check if property is valid (not null)
        const items = res.data.wishlist || [];
        setWishlistItems(items);
      } else {
        setError("Failed to fetch wishlist items.");
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
      setError(err.response?.data?.message || "Failed to load wishlist.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [user, navigate, fetchWishlist]);

  const handleToggleWishlist = async (propertyId) => {
    try {
      // Remove from wishlist database-side
      const res = await api.delete(`/api/wishlist/${propertyId}`);
      if (res.data.success) {
        // Update local state instantly for responsiveness
        setWishlistItems((prev) => prev.filter((item) => item.property?._id !== propertyId));
      } else {
        alert("Failed to remove item. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting from wishlist:", err);
      alert(err.response?.data?.message || "Error removing item.");
    }
  };

  if (loading) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className={s.pageContainer}>
      <Navbar />
      <main className={s.mainContainer}>
        {/* Page Header */}
        <div className={s.headingWrapper}>
          <h1 className={`${s.heading} font-black text-slate-900 tracking-tight`}>My Wishlist</h1>
          <p className={s.subheading}>Keep track of the properties you're interested in</p>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
            <span>{error}</span>
            <button onClick={fetchWishlist} className="font-bold underline cursor-pointer">Retry</button>
          </div>
        )}

        {/* Empty State */}
        {wishlistItems.length === 0 ? (
          <div className={s.emptyCard}>
            <div className={s.emptyIconWrapper}>
              <HiOutlineHeart size={44} className="text-slate-400" />
            </div>
            <h2 className={`${s.emptyTitle} text-2xl font-extrabold text-slate-900`}>Your wishlist is empty</h2>
            <p className={s.emptyText}>Explore properties and save them to find them easily later.</p>
            <Link to="/properties" className={s.browseButton}>
              Browse Properties
            </Link>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className={s.gridContainer}>
            {wishlistItems.map((item) => (
              <div key={item._id} className="w-full flex flex-col justify-between h-full bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100 border border-slate-100 transition-all duration-500">
                <PropertyCard
                  property={item.property}
                  isWishlisted={true}
                  onToggleWishlist={handleToggleWishlist}
                  renderActions={(property) => (
                    <button
                      onClick={() => handleToggleWishlist(property._id)}
                      className={s.removeButton}
                    >
                      <HiOutlineTrash size={16} /> Remove
                    </button>
                  )}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
