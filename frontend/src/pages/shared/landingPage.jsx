import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  HiSearch,
  HiHome,
  HiOfficeBuilding,
  HiShieldCheck,
  HiArrowRight,
  HiHeart,
  HiOutlineHeart,
  HiLocationMarker,
  HiStar,
  HiPhone,
  HiMail,
  HiChevronDown,
} from "react-icons/hi";
import axios from "axios";
import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../context/AuthContext";

const API_URL = "http://localhost:5000";

/* ─── Tiny animation helper ──────────────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
};

/* ─── Stat counter ───────────────────────────────────────────────────── */
const StatCounter = ({ end, suffix = "", label }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(end / 60);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(start);
    }, 20);
    return () => clearInterval(timer);
  }, [visible, end]);
  return (
    <div ref={ref} className="text-center lg:text-left">
      <span className="text-4xl font-black text-slate-900 tracking-tighter tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
    </div>
  );
};

/* ─── Property Card ──────────────────────────────────────────────────── */
const PropertyCard = ({ property, isSaved, onToggleWishlist, processing }) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/70 border border-slate-100 hover:border-slate-200 transition-all duration-500 hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 animate-pulse" />
        )}
        <img
          src={property.images?.[0] || "/images/property-placeholder.jpg"}
          alt={property.title}
          onLoad={() => setImgLoaded(true)}
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=70"; setImgLoaded(true); }}
          className="w-full h-full object-cover group-hover:scale-107 transition-transform duration-700"
          style={{ transform: "scale(1)" }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Type badge */}
        {property.type && (
          <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-700 text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            {property.type}
          </span>
        )}

        {/* Wishlist btn */}
        <button
          onClick={(e) => onToggleWishlist(e, property._id)}
          disabled={processing}
          aria-label={isSaved ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm shadow-md border border-white/50 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50"
        >
          {isSaved
            ? <HiHeart size={18} className="text-rose-500" />
            : <HiOutlineHeart size={18} className="text-slate-500" />}
        </button>

        {/* Price on image */}
        <div className="absolute bottom-4 left-4">
          <span className="text-white font-black text-xl drop-shadow-md">
            ${property.price?.toLocaleString() ?? "P.O.A."}
          </span>
        </div>
      </div>

      {/* Content */}
      <Link to={`/properties/${property._id}`} className="block p-5">
        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-2">
          <HiLocationMarker size={13} className="text-emerald-500 shrink-0" />
          <span className="truncate">{property.location || "Prime Location"}</span>
        </div>
        <h4 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors line-clamp-1 mb-3">
          {property.title}
        </h4>

        {/* Specs row */}
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-50">
            {property.bedrooms && <span>{property.bedrooms} Beds</span>}
            {property.bathrooms && <span>{property.bathrooms} Baths</span>}
            {property.area && <span>{property.area} sq ft</span>}
          </div>
        )}
      </Link>
    </div>
  );
};

/* ─── Main Page ───────────────────────────────────────────────────────── */
const LandingPage = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [propertyType, setPropertyType] = useState("all");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistProcessing, setWishlistProcessing] = useState(false);
  const [propertyCounts, setPropertyCounts] = useState({ flat: 0, villa: 0, penthouse: 0, commercial: 0 });
  const [wishlistedIDs, setWishlistedIDs] = useState([]);
  const [featRef, featVisible] = useReveal();
  const [whyRef, whyVisible] = useReveal();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchProperties(), fetchCounts()]);
      if (user && token) await fetchWishlist();
      setLoading(false);
    };
    init();
  }, [user, token]);

  const fetchProperties = async (search = "") => {
    try {
      const endpoint = search
        ? `${API_URL}/api/properties?city=${encodeURIComponent(search)}`
        : `${API_URL}/api/properties?limit=6`;
      const res = await axios.get(endpoint);
      setProperties(res.data?.properties ?? (Array.isArray(res.data) ? res.data : []));
      setError(null);
    } catch {
      setError("Failed to load properties. Please try again.");
    }
  };

  const fetchCounts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/properties/counts`);
      if (res.data) setPropertyCounts({ flat: res.data.flat || 0, villa: res.data.villa || 0, penthouse: res.data.penthouse || 0, commercial: res.data.commercial || 0 });
    } catch { /* silent */ }
  };

  const fetchWishlist = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      if (Array.isArray(res.data)) {
        setWishlistedIDs(res.data.filter(i => i?.property).map(i => String(i.property._id)));
      }
    } catch { /* silent */ }
  };

  const handleToggleWishlist = async (e, propertyId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || !token) { navigate("/login"); return; }
    if (wishlistProcessing) return;
    const id = String(propertyId);
    const saved = wishlistedIDs.includes(id);
    setWishlistProcessing(true);
    try {
      if (saved) {
        await axios.delete(`${API_URL}/api/wishlist/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistedIDs(p => p.filter(x => x !== id));
      } else {
        await axios.post(`${API_URL}/api/wishlist`, { propertyId: id }, { headers: { Authorization: `Bearer ${token}` } });
        setWishlistedIDs(p => [...p, id]);
      }
    } catch {
      setError("Unable to update wishlist. Please try again.");
    } finally {
      setWishlistProcessing(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append("city", searchQuery);
    if (propertyType !== "all") params.append("type", propertyType);
    navigate(`/properties?${params.toString()}`);
  };

  /* ─── TESTIMONIALS (static) ──────────────────────────────────────── */
  const testimonials = [
    { name: "Sarah M.", role: "First-time Buyer", text: "Found my dream apartment in under a week. The search tools are incredibly powerful and the team made everything seamless.", stars: 5 },
    { name: "James T.", role: "Property Investor", text: "The verified listings gave me the confidence to invest remotely. ROI has been exceptional.", stars: 5 },
    { name: "Priya K.", role: "Homeowner", text: "Sold our villa within days at above asking price. Outstanding service from start to finish.", stars: 5 },
  ];

  /* ─── FEATURES ───────────────────────────────────────────────────── */
  const features = [
    {
      icon: <HiSearch size={24} />,
      title: "Smart Property Search",
      desc: "Filter by location, price, type, and dozens of other parameters to find exactly what you need — fast.",
    },
    {
      icon: <HiShieldCheck size={24} />,
      title: "100% Verified Listings",
      desc: "Every property is background-checked and document-verified before going live on our platform.",
    },
    {
      icon: <HiOfficeBuilding size={24} />,
      title: "Expert Brokerage Advisors",
      desc: "Dedicated agents with deep local market knowledge guide you through every step of the process.",
    },
  ];

  /* ─── RENDER ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 overflow-x-hidden font-sans">
      <Navbar />

      {/* ══════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════ */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-0 overflow-hidden">
        {/* Decorative background blobs */}
        <div aria-hidden className="pointer-events-none absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-100/20 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-0 left-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-slate-100/80 to-transparent blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">

            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100/80 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
                Trusted by 10,000+ Buyers & Investors
              </span>
            </div>

            <h1 className="text-[3.25rem] sm:text-[4rem] lg:text-[4.25rem] font-black leading-[1.08] tracking-tighter text-slate-900 max-w-xl">
              Find Your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                  Dream Home
                </span>
                <span aria-hidden className="absolute left-0 -bottom-1 w-full h-3 bg-emerald-100 rounded -z-0 skew-x-2" />
              </span>{" "}
              With Confidence
            </h1>

            <p className="mt-6 text-lg text-slate-500 max-w-md leading-relaxed">
              Premium apartments, luxury villas, and high-yield investment properties
              in the most desirable locations. Your real estate journey, simplified.
            </p>

            {/* ── SEARCH FORM ── */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-10 w-full max-w-xl bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-2 flex flex-col sm:flex-row gap-2"
            >
              {/* City input */}
              <div className="flex flex-1 items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl">
                <HiSearch size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="City, neighborhood, or ZIP…"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-sm bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Type select */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 rounded-xl sm:w-40">
                <HiHome size={16} className="text-slate-400 shrink-0" />
                <select
                  value={propertyType}
                  onChange={e => setPropertyType(e.target.value)}
                  className="bg-transparent text-sm text-slate-600 font-medium focus:outline-none cursor-pointer w-full"
                >
                  <option value="all">All Types</option>
                  <option value="flat">Apartments</option>
                  <option value="villa">Villas</option>
                  <option value="penthouse">Penthouses</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-sm px-7 py-3 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-600/20 shrink-0"
              >
                Search
              </button>
            </form>

            {/* Popular links */}
            <div className="mt-5 flex flex-wrap justify-center lg:justify-start gap-x-5 gap-y-2 text-sm text-slate-400">
              <span>Popular:</span>
              {[
                { label: `Villas (${propertyCounts.villa})`, to: "/properties?type=villa" },
                { label: `Apartments (${propertyCounts.flat})`, to: "/properties?type=flat" },
                { label: `Penthouses (${propertyCounts.penthouse})`, to: "/properties?type=penthouse" },
              ].map(l => (
                <Link key={l.to} to={l.to} className="hover:text-emerald-600 font-medium transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-14 pt-8 border-t border-slate-200/60 w-full max-w-lg">
              <StatCounter end={5000} suffix="+" label="Listed Properties" />
              <StatCounter end={1200} suffix="+" label="Happy Clients" />
              <StatCounter end={50} suffix="+" label="Cities Covered" />
            </div>
          </div>

          {/* RIGHT — hero image */}
          <div className="hidden lg:block relative pb-12">
            {/* Floating card — avg price */}
            <div className="absolute -left-6 top-10 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <HiHome size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">Avg. Market Price</p>
                <p className="text-base font-black text-slate-900">$485,000</p>
              </div>
            </div>

            {/* Floating card — new listings */}
            <div className="absolute -right-2 bottom-20 z-20 bg-white rounded-2xl shadow-xl border border-slate-100 px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center">
                <HiStar size={20} className="text-teal-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium">New This Week</p>
                <p className="text-base font-black text-slate-900">24 Listings</p>
              </div>
            </div>

            {/* Main image */}
            <div className="relative rounded-3xl overflow-hidden shadow-[0_30px_80px_rgba(15,23,42,0.14)] border border-white/60">
              <img
                src="/images/hero-house.jpg"
                alt="Luxury modern house"
                className="w-full h-auto object-cover"
                onError={e => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80"; }}
              />
              {/* Bottom tint */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="flex justify-center mt-12 lg:mt-6 animate-bounce">
          <HiChevronDown size={22} className="text-slate-300" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CATEGORY QUICK-FILTERS
      ══════════════════════════════════════════════════ */}
      <section className="py-12 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Apartments", type: "flat", count: propertyCounts.flat, emoji: "🏢" },
            { label: "Villas", type: "villa", count: propertyCounts.villa, emoji: "🏡" },
            { label: "Penthouses", type: "penthouse", count: propertyCounts.penthouse, emoji: "🌆" },
            { label: "Commercial", type: "commercial", count: propertyCounts.commercial, emoji: "🏬" },
          ].map(c => (
            <Link
              key={c.type}
              to={`/properties?type=${c.type}`}
              className="group flex flex-col items-center justify-center gap-2 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{c.label}</span>
              <span className="text-xs text-slate-400 font-medium">{c.count} listings</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FEATURED PROPERTIES
      ══════════════════════════════════════════════════ */}
      {!loading && properties.length > 0 && (
        <section ref={featRef} className={`py-16 px-6 max-w-7xl mx-auto transition-all duration-700 ${featVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Our Selection</p>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">Featured Listings</h2>
              <p className="text-slate-500 text-sm mt-2 max-w-md">Handpicked properties that represent exceptional value and quality.</p>
            </div>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-xl transition-all duration-200 shrink-0"
            >
              View All Properties <HiArrowRight size={16} />
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {properties.map(property => (
              <PropertyCard
                key={property._id}
                property={property}
                isSaved={wishlistedIDs.includes(String(property._id))}
                onToggleWishlist={handleToggleWishlist}
                processing={wishlistProcessing}
              />
            ))}
          </div>
        </section>
      )}

      {/* Loading skeletons */}
      {loading && (
        <section className="py-16 px-6 max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-pulse">
                <div className="aspect-[4/3] bg-slate-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                  <div className="h-4 bg-slate-100 rounded w-full" />
                  <div className="h-5 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════════════
          WHY US
      ══════════════════════════════════════════════════ */}
      <section ref={whyRef} className={`py-24 px-6 bg-white border-y border-slate-100 transition-all duration-700 ${whyVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Our Advantage</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter leading-tight">
              Why Thousands of Investors Choose Us
            </h2>
            <p className="mt-4 text-base text-slate-500 leading-relaxed">
              We combine cutting-edge technology with deep local expertise to make real estate
              transactions simple, secure, and transparent.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-7">
            {features.map((f, i) => (
              <div
                key={i}
                className="group p-8 rounded-2xl border border-slate-100 hover:border-emerald-100 bg-slate-50/50 hover:bg-white shadow-sm hover:shadow-xl hover:shadow-emerald-50/50 transition-all duration-400"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 mb-6">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════ */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Client Stories</p>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter">What Our Clients Say</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-shadow duration-300">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.stars)].map((_, s) => (
                  <HiStar key={s} size={16} className="text-amber-400" />
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════ */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white px-8 py-20 text-center shadow-2xl">
          {/* Decorative circles */}
          <div aria-hidden className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
          <div aria-hidden className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
          <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_50%)] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-5">Get Started Today</p>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter leading-tight">
              Ready to Find Your<br />Next Property?
            </h2>
            <p className="mt-5 text-slate-300 text-base leading-relaxed max-w-lg mx-auto">
              Join thousands of homeowners and investors who found their ideal properties through Emerald Estates.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:-translate-y-0.5 w-full sm:w-auto justify-center group"
              >
                Browse Live Properties
                <HiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all duration-200 w-full sm:w-auto"
              >
                Create Free Account
              </Link>
            </div>

            {/* Contact strip */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
              <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-white transition-colors">
                <HiPhone size={15} /> +1 (234) 567-890
              </a>
              <span className="hidden sm:block text-slate-700">|</span>
              <a href="mailto:hello@emeraldestates.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <HiMail size={15} /> hello@emeraldestates.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          FOOTER STRIP
      ══════════════════════════════════════════════════ */}
      <footer className="border-t border-slate-100 py-8 px-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Emerald Estates. All rights reserved.
        <span className="mx-3">·</span>
        <Link to="/privacy" className="hover:text-slate-600 transition-colors">Privacy</Link>
        <span className="mx-3">·</span>
        <Link to="/terms" className="hover:text-slate-600 transition-colors">Terms</Link>
      </footer>

      {/* Tailwind animation utilities (add to global CSS if not present) */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default LandingPage;
