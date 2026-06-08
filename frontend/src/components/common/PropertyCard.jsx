import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  HiHeart, 
  HiOutlineHeart, 
  HiLocationMarker, 
  HiEye 
} from "react-icons/hi";
import { useAuth } from "../../context/AuthContext";

const PropertyCard = ({
  property,
  renderActions,
  isWishlisted,
  onToggleWishlist,
}) => {
  if (!property) return null;

  const { user } = useAuth();
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);

  // ── Wishlist click handler ─────────────────────────────────────────────
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

  // ── Price formatting (LKR) ──────────────────────────────────────────────
  const formattedPrice = new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(property.price ?? 0);

  // ── Status badge helper ────────────────────────────────────────────────
  const statusBadgeClass =
    property.status === "sale"
      ? "bg-emerald-500 text-white"
      : property.status === "rent"
      ? "bg-blue-600 text-white"
      : "bg-slate-600 text-white";

  const statusLabel =
    property.status === "sale"
      ? "For Sale"
      : property.status === "rent"
      ? "For Rent"
      : property.status ?? "Available";

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 border border-slate-150/80 hover:border-slate-300/70 transition-all duration-500 hover:-translate-y-1.5 flex flex-col h-full">
      <Link to={`/properties/${property._id}`} className="block flex-1 flex flex-col">
        
        {/* ── Image & Media Window ── */}
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
          {/* Skeleton shimmer */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
          )}

          <img
            src={property.images?.[0] || "/images/property-placeholder.jpg"}
            alt={property.title}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70";
              setImgLoaded(true);
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Clean Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />

          {/* Badges Layout */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 max-w-[calc(100%-5rem)]">
            <span className={`text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm ${statusBadgeClass}`}>
              {statusLabel}
            </span>

            {property.type && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur-sm text-slate-800 shadow-sm border border-slate-200/20">
                {property.type}
              </span>
            )}
          </div>

          {/* Wishlist Button Core */}
          <button
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-sm shadow-md border border-slate-200/10 transition-all duration-200 hover:scale-105 active:scale-95 text-slate-700 z-10"
          >
            {isWishlisted ? (
              <HiHeart size={19} className="text-rose-500 drop-shadow-sm" />
            ) : (
              <HiOutlineHeart size={19} className="text-slate-600 hover:text-rose-500 transition-colors" />
            )}
          </button>

          {/* Price Tag Overlay */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <span className="text-white font-black text-2xl tracking-tight drop-shadow-md">
              {formattedPrice}
            </span>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="p-5 flex flex-col flex-1 justify-between">
          <div>
            {/* Location Tag */}
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md text-slate-600 text-xs font-semibold mb-3 max-w-full">
              <HiLocationMarker size={14} className="text-emerald-600 shrink-0" />
              <span className="truncate tracking-wide">{property.location || "Prime Location, LK"}</span>
            </div>

            {/* Title */}
            <h4 className="font-extrabold text-slate-900 text-base lg:text-lg group-hover:text-emerald-600 transition-colors duration-300 line-clamp-2 leading-snug mb-4">
              {property.title}
            </h4>
          </div>

          {/* Specs & Metrics Split Footer */}
          <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
            {/* Beds / Baths / SqFt Specs Box */}
            <div className="flex items-center gap-3 text-xs font-bold text-slate-700">
              {property.bedrooms && (
                <div className="flex items-baseline gap-0.5">
                  <span className="text-slate-900 text-sm font-black">{property.bedrooms}</span>
                  <span className="text-slate-400 font-medium text-[11px]">Beds</span>
                </div>
              )}
              
              {property.bathrooms && (
                <div className="flex items-baseline gap-0.5 border-l border-slate-200 pl-3">
                  <span className="text-slate-900 text-sm font-black">{property.bathrooms}</span>
                  <span className="text-slate-400 font-medium text-[11px]">Baths</span>
                </div>
              )}

              {property.area && (
                <div className="flex items-baseline gap-1 border-l border-slate-200 pl-3">
                  <span className="text-slate-500 font-medium text-[11px]">
                    {property.area.toLocaleString()} <span className="text-[10px]">sq ft</span>
                  </span>
                </div>
              )}
            </div>

            {/* Professional Analytics View Counter */}
            <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs bg-slate-50/60 px-2 py-1 rounded-md border border-slate-100/50">
              <HiEye size={14} className="text-slate-400" />
              <span className="tabular-nums">{property.views?.toLocaleString() ?? "0"}</span>
            </div>
          </div>

          {/* Action Slots Injection Row */}
          {renderActions && (
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              {renderActions(property)}
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PropertyCard;