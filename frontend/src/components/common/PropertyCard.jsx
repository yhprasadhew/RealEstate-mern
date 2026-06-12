import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HiHeart, HiOutlineHeart, HiLocationMarker, HiEye } from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

const PropertyCard = ({ property, renderActions, isWishlisted, onToggleWishlist }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!property) return null;

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (onToggleWishlist) {
      onToggleWishlist(property._id);
    }
  };

  const formattedPrice = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(property.price ?? 0);

  const statusBadgeClass =
    property.status === "sale"
      ? "bg-emerald-600 text-white"
      : property.status === "rent"
      ? "bg-blue-600 text-white"
      : "bg-slate-700 text-white";

  const statusLabel = property.status === "sale" ? "FOR SALE" : property.status === "rent" ? "FOR RENT" : "AVAILABLE";

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-100 border border-slate-100 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
      <Link to={`/properties/${property._id}`} className="block flex-1 flex flex-col">
        
        {/* ── Image Section ── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
          {!imgLoaded && <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />}
          <img
            src={property.images?.[0] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70"}
            alt={property.title}
            onLoad={() => setImgLoaded(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className={`text-[10px] font-extrabold tracking-wider px-3 py-1.5 rounded-lg shadow-sm ${statusBadgeClass}`}>
              {statusLabel}
            </span>
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-md text-slate-700 hover:scale-105 transition-transform z-10"
          >
            {isWishlisted ? <HiHeart size={18} className="text-rose-500" /> : <HiOutlineHeart size={18} className="text-slate-500" />}
          </button>

          {/* Dynamic Price Overlay */}
          <div className="absolute bottom-4 left-4">
            <span className="text-white font-black text-xl drop-shadow-md tracking-tight">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Location Pill */}
            <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-full text-slate-500 text-xs font-medium mb-3">
              <HiLocationMarker size={14} className="text-emerald-500 shrink-0" />
              <span className="truncate">
                {property.area && property.city 
                  ? `${property.area}, ${property.city}` 
                  : "Prime Location, LK"}
              </span>
            </div>

            {/* Title */}
            <h4 className="font-extrabold text-slate-900 text-lg group-hover:text-emerald-600 transition-colors duration-300 line-clamp-1 mb-4">
              {property.title}
            </h4>
          </div>

          {/* ── Specs & Footer Row (Matches Screenshot Exactly) ── */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
            <div className="flex items-center text-xs font-semibold text-slate-400 gap-2.5">
              
              {/* BHK / Beds Count */}
              {property.bhk && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-800 font-bold">{property.bhk}</span>
                  <span>BHK</span>
                </div>
              )}

              {/* Divider */}
              {property.bhk && property.bathrooms && <span className="text-slate-200">|</span>}

              {/* Baths Count */}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <span className="text-slate-800 font-bold">{property.bathrooms}</span>
                  <span>{property.bathrooms === 1 ? "Bath" : "Baths"}</span>
                </div>
              )}

              {/* Divider */}
              {property.bathrooms && property.areaSize && <span className="text-slate-200">|</span>}

              {/* Area Size */}
              {property.areaSize && (
                <div className="flex items-center gap-1">
                  <span className="truncate">{property.areaSize} sq ft</span>
                </div>
              )}
            </div>

            {/* View Counter */}
            <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs border border-slate-200 px-2 py-1 rounded-md">
              <HiEye size={14} />
              <span className="tabular-nums">{property.views ?? 0}</span>
            </div>
          </div>

          {renderActions && (
            <div className="mt-4 pt-3 border-t border-slate-100">
              {renderActions(property)}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;