import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineAdjustments,
  HiViewGrid,
  HiViewList,
  HiSelector,
  HiLocationMarker,
  HiX,
  HiSearch,
  HiHeart,
  HiChevronDown,
  HiSparkles,
  HiFilter,
} from "react-icons/hi";

import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";
import PropertyCard from "../../components/common/PropertyCard";
import API_URL from "../../config";

/* ─── tiny animation helper injected once ────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;1,9..144,300&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:       #0d1117;
    --ink-muted: #6b7a90;
    --surface:   #f5f6fa;
    --card:      #ffffff;
    --accent:    #1a6b4a;
    --accent-lt: #e6f4ed;
    --accent-glow: rgba(26,107,74,0.12);
    --border:    rgba(0,0,0,0.08);
    --radius:    16px;
  }

  .prop-page { font-family: 'DM Sans', sans-serif; background: var(--surface); min-height: 100vh; color: var(--ink); }

  /* fade-up on mount */
  @keyframes fadeUp   { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
  @keyframes shimmer  { 0%,100%{background-position:200% center} 50%{background-position:-200% center} }
  @keyframes spin360  { to { transform: rotate(360deg) } }
  @keyframes badgePop { 0%{transform:scale(0)} 80%{transform:scale(1.15)} 100%{transform:scale(1)} }

  .anim-up      { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) both }
  .anim-up-2    { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) 0.08s both }
  .anim-up-3    { animation: fadeUp 0.45s cubic-bezier(.22,1,.36,1) 0.16s both }

  /* skeleton shimmer */
  .skel {
    background: linear-gradient(90deg, #e8eaed 25%, #f4f5f7 50%, #e8eaed 75%);
    background-size: 400% 100%;
    animation: shimmer 1.6s ease-in-out infinite;
    border-radius: 12px;
  }

  /* filter pill */
  .filter-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 4px 12px 4px 10px;
    background: var(--accent-lt); border: 1px solid rgba(26,107,74,.2);
    border-radius: 999px; font-size: 11px; font-weight: 600; color: var(--accent);
    animation: badgePop .25s ease both;
  }
  .filter-pill button { display:flex; align-items:center; background:none; border:none; cursor:pointer; color:var(--accent); padding:0; line-height:1 }

  /* sidebar section accordion */
  .section-body { overflow: hidden; transition: max-height .3s ease, opacity .3s ease }

  /* sort select arrow */
  .sort-select { appearance: none; cursor: pointer; }

  /* checkbox custom */
  .prop-check { accent-color: var(--accent); }

  /* stat box */
  .stat-box {
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    background: var(--card);
    transition: box-shadow .2s;
  }
  .stat-box:hover { box-shadow: 0 4px 20px rgba(0,0,0,.06); }

  /* card hover lift (wraps PropertyCard) */
  .card-wrap { transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s; border-radius: var(--radius); }
  .card-wrap:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,.10); }

  /* view toggle */
  .vtog { padding: 7px; border-radius: 10px; border: none; background: none; cursor: pointer; transition: background .15s, color .15s; color: #94a3b8; }
  .vtog.active { background: var(--card); color: var(--accent); box-shadow: 0 1px 4px rgba(0,0,0,.1); }

  /* mobile filter sheet overlay */
  .filter-overlay { position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:40; backdrop-filter:blur(3px); animation: fadeUp .2s both }
  .filter-sheet   { position:fixed; bottom:0; left:0; right:0; max-height:90vh; overflow-y:auto; background:var(--card); border-radius:24px 24px 0 0; z-index:50; padding:24px 20px 40px; animation: fadeUp .3s cubic-bezier(.22,1,.36,1) both }

  /* accent button */
  .btn-accent { background:var(--accent); color:#fff; border:none; border-radius:12px; font-weight:700; font-size:13px; padding:10px 22px; cursor:pointer; transition: filter .15s, transform .1s; }
  .btn-accent:hover { filter:brightness(1.08) }
  .btn-accent:active { transform: scale(.97) }

  .btn-ghost { background: none; border: 1.5px solid var(--border); border-radius: 10px; font-size:12px; font-weight:600; color:var(--ink-muted); padding:8px 16px; cursor:pointer; transition:border-color .15s, color .15s }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent) }

  /* range track */
  input[type=range] { accent-color: var(--accent); width:100%; }

  /* no results */
  .empty-box { text-align:center; padding:80px 24px; background:var(--card); border-radius:var(--radius); border:1px solid var(--border) }
`;

/* ─── Collapsible sidebar section ──────────────────────────────────── */
function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: 0, marginBottom: open ? 14 : 0,
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-muted)" }}>{title}</span>
        <HiChevronDown
          size={15}
          style={{ color: "var(--ink-muted)", transition: "transform .25s", transform: open ? "rotate(180deg)" : "none" }}
        />
      </button>
      <div className="section-body" style={{ maxHeight: open ? 600 : 0, opacity: open ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Active filter pills row ───────────────────────────────────────── */
function ActiveFilters({ filters, onRemove, onClearAll }) {
  const pills = [];
  if (filters.city) pills.push({ key: "city", label: `📍 ${filters.city}` });
  filters.propertyType.forEach((t) =>
    pills.push({ key: `type:${t}`, label: `🏠 ${t.charAt(0).toUpperCase() + t.slice(1)}` })
  );
  if (filters.bhk) pills.push({ key: "bhk", label: `🛏 ${filters.bhk} BHK` });
  if (filters.minPrice) pills.push({ key: "minPrice", label: `Min ₹${filters.minPrice}Mn` });
  if (filters.maxPrice) pills.push({ key: "maxPrice", label: `Max ₹${filters.maxPrice}Mn` });

  if (!pills.length) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
      {pills.map((p) => (
        <span key={p.key} className="filter-pill">
          {p.label}
          <button onClick={() => onRemove(p.key)}><HiX size={11} /></button>
        </span>
      ))}
      <button className="btn-ghost" style={{ fontSize: 11, padding: "4px 12px" }} onClick={onClearAll}>
        Clear all
      </button>
    </div>
  );
}

/* ─── BHK chip selector ─────────────────────────────────────────────── */
function BHKSelector({ value, onChange }) {
  const options = ["1", "2", "3", "4", "5+"];
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(value === o ? "" : o)}
          style={{
            padding: "6px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all .15s",
            background: value === o ? "var(--accent)" : "var(--surface)",
            color: value === o ? "#fff" : "var(--ink-muted)",
            border: value === o ? "1.5px solid var(--accent)" : "1.5px solid var(--border)",
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/* ─── Skeleton card ─────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: "var(--card)", borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div className="skel" style={{ height: 200 }} />
      <div style={{ padding: "16px 18px" }}>
        <div className="skel" style={{ height: 18, width: "70%", marginBottom: 10 }} />
        <div className="skel" style={{ height: 13, width: "50%", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 8 }}>
          <div className="skel" style={{ height: 28, flex: 1 }} />
          <div className="skel" style={{ height: 28, flex: 1 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main Component
   ══════════════════════════════════════════════════════════════════════ */
const Properties = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuth();
  const searchRef = useRef(null);

  const [properties, setProperties] = useState([]);
  const [wishlistedIds, setWishlistedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchCity, setSearchCity] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [resultCount, setResultCount] = useState(null); // for animated count

  const [filters, setFilters] = useState({
    city: "", propertyType: [], bhk: "", minPrice: "", maxPrice: "",
    amenities: [], sort: "latest",
  });

  const propertyTypes = [
    { label: "Flat / Apartment", value: "flat" },
    { label: "House / Villa", value: "villa" },
    { label: "Penthouse", value: "penthouse" },
    { label: "Commercial", value: "commercial" },
  ];

  /* URL sync */
  const updateURLParams = (f) => {
    const p = new URLSearchParams();
    if (f.city) p.append("city", f.city);
    if (f.propertyType.length) p.append("type", f.propertyType[0]);
    if (f.bhk) p.append("bhk", f.bhk);
    if (f.minPrice) p.append("minPrice", f.minPrice);
    if (f.maxPrice) p.append("maxPrice", f.maxPrice);
    if (f.sort) p.append("sort", f.sort);
    navigate({ pathname: location.pathname, search: p.toString() ? `?${p}` : "" }, { replace: true });
  };

  /* fetch */
  const fetchProperties = useCallback(async (f) => {
    try {
      setLoading(true);
      setError(null);
      const p = new URLSearchParams();
      if (f.city) p.append("city", f.city);
      if (f.bhk) {
        const bhkValue = f.bhk.endsWith("BHK") || f.bhk === "5+" ? f.bhk : `${f.bhk} BHK`;
        p.append("bhk", bhkValue);
      }
      if (f.sort) p.append("sort", f.sort);
      if (f.minPrice) p.append("minPrice", parseFloat(f.minPrice) * 1000000);
      if (f.maxPrice) p.append("maxPrice", parseFloat(f.maxPrice) * 1000000);
      if (f.propertyType.length) {
        const map = (v) => ({ flat: "apartment", villa: "house" }[v] || v);
        p.append("propertyType", f.propertyType.map(map).join(","));
      }

      const res = await axios.get(`${API_URL}/api/property?${p.toString()}`);
      const list = res.data?.properties ?? [];
      setProperties(list);
      setResultCount(list.length);
    } catch (e) {
      setError(e.response?.data?.message || "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/api/wishlist`, { headers: { Authorization: `Bearer ${token}` } });
      setWishlistedIds(res.data.filter((i) => i?.property).map((i) => String(i.property._id || i.property)));
    } catch {}
  }, [token]);

  const handleToggleWishlist = async (id) => {
    if (!user) { navigate("/login"); return; }
    setWishlistedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
    try {
      await axios.post(`${API_URL}/api/wishlist/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
    } catch { fetchWishlist(); }
  };

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const f = {
      city: q.get("city") || "", propertyType: q.get("type") ? [q.get("type")] : [],
      bhk: q.get("bhk") || "", minPrice: q.get("minPrice") || "",
      maxPrice: q.get("maxPrice") || "", amenities: [], sort: q.get("sort") || "latest",
    };
    setFilters(f);
    setSearchCity(f.city);
    fetchProperties(f);
    if (user) fetchWishlist();
  }, [location.search, user, fetchProperties, fetchWishlist]);

  /* debounce city search */
  useEffect(() => {
    if (searchCity === filters.city) return;
    const t = setTimeout(() => {
      const u = { ...filters, city: searchCity };
      setFilters(u); updateURLParams(u);
    }, 420);
    return () => clearTimeout(t);
  }, [searchCity, filters]);

  /* remove a specific pill */
  const removeFilter = (key) => {
    let u = { ...filters };
    if (key === "city") { u.city = ""; setSearchCity(""); }
    else if (key === "bhk") u.bhk = "";
    else if (key === "minPrice") u.minPrice = "";
    else if (key === "maxPrice") u.maxPrice = "";
    else if (key.startsWith("type:")) u.propertyType = u.propertyType.filter((x) => `type:${x}` !== key);
    setFilters(u); updateURLParams(u);
  };

  const clearAllFilters = () => {
    const u = { city: "", propertyType: [], bhk: "", minPrice: "", maxPrice: "", amenities: [], sort: filters.sort };
    setFilters(u); setSearchCity(""); updateURLParams(u);
  };

  const activeFilterCount = [
    filters.city, filters.bhk, filters.minPrice, filters.maxPrice,
    ...filters.propertyType,
  ].filter(Boolean).length;

  /* ── Sidebar filter panel (shared between desktop & mobile sheet) ── */
  const FilterPanel = () => (
    <>
      {/* Search */}
      <FilterSection title="Location" defaultOpen={true}>
        <div
          style={{
            display: "flex", alignItems: "center", gap: 10,
            background: searchFocused ? "#fff" : "var(--surface)",
            border: `1.5px solid ${searchFocused ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 12, padding: "9px 13px",
            boxShadow: searchFocused ? "0 0 0 4px var(--accent-glow)" : "none",
            transition: "all .2s",
          }}
        >
          <HiSearch size={15} style={{ color: "var(--ink-muted)", flexShrink: 0 }} />
          <input
            ref={searchRef}
            type="text"
            value={searchCity}
            onChange={(e) => setSearchCity(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="City, district, area…"
            style={{
              background: "none", border: "none", outline: "none", fontSize: 13,
              fontWeight: 500, color: "var(--ink)", flex: 1, fontFamily: "inherit",
            }}
          />
          {searchCity && (
            <button
              onClick={() => setSearchCity("")}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-muted)", display: "flex", alignItems: "center", padding: 0 }}
            >
              <HiX size={13} />
            </button>
          )}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range (LKR Millions)">
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {["minPrice", "maxPrice"].map((field, i) => (
            <React.Fragment key={field}>
              {i === 1 && <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>–</span>}
              <div style={{ position: "relative", flex: 1 }}>
                <input
                  type="number" step="any"
                  value={filters[field]}
                  onChange={(e) => {
                    const u = { ...filters, [field]: e.target.value };
                    setFilters(u); updateURLParams(u);
                  }}
                  placeholder={i === 0 ? "Min" : "Max"}
                  style={{
                    width: "100%", boxSizing: "border-box", paddingLeft: 10, paddingRight: 28, paddingTop: 9, paddingBottom: 9,
                    background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10,
                    fontSize: 12, fontWeight: 700, outline: "none", fontFamily: "inherit", color: "var(--ink)",
                    WebkitAppearance: "none", MozAppearance: "textfield",
                  }}
                />
                <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 800, color: "var(--ink-muted)", pointerEvents: "none" }}>Mn</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </FilterSection>

      {/* BHK */}
      <FilterSection title="Bedrooms (BHK)">
        <BHKSelector value={filters.bhk} onChange={(v) => { const u = { ...filters, bhk: v }; setFilters(u); updateURLParams(u); }} />
      </FilterSection>

      {/* Property Type */}
      <FilterSection title="Property Type">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {propertyTypes.map((t) => {
            const on = filters.propertyType.includes(t.value);
            return (
              <label
                key={t.value}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 10, cursor: "pointer", transition: "all .15s",
                  background: on ? "var(--accent-lt)" : "var(--surface)",
                  border: `1.5px solid ${on ? "rgba(26,107,74,.25)" : "transparent"}`,
                }}
              >
                <input
                  type="checkbox" className="prop-check"
                  checked={on}
                  onChange={(e) => {
                    const next = e.target.checked ? [...filters.propertyType, t.value] : filters.propertyType.filter((x) => x !== t.value);
                    const u = { ...filters, propertyType: next };
                    setFilters(u); updateURLParams(u);
                  }}
                  style={{ width: 15, height: 15 }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: on ? "var(--accent)" : "var(--ink-muted)" }}>{t.label}</span>
              </label>
            );
          })}
        </div>
      </FilterSection>

      {activeFilterCount > 0 && (
        <button className="btn-ghost" style={{ width: "100%", marginTop: 4 }} onClick={clearAllFilters}>
          Reset all filters ({activeFilterCount})
        </button>
      )}
    </>
  );

  /* ── Stat pill ── */
  const StatPill = ({ icon, label, value }) => (
    <div className="stat-box" style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ fontSize: 22 }}>{icon}</div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ink)", lineHeight: 1.1, fontFamily: "'Fraunces', serif" }}>{value}</div>
        <div style={{ fontSize: 10, fontWeight: 600, color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
      </div>
    </div>
  );

  return (
    <>
      <style>{STYLES}</style>
      <div className="prop-page">
        <Navbar />

        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px 20px 60px" }}>

          {/* ── Hero header ── */}
          <div className="anim-up" style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--accent-lt)", border: "1px solid rgba(26,107,74,.18)", borderRadius: 8, padding: "4px 12px", marginBottom: 10 }}>
                  <HiSparkles size={12} style={{ color: "var(--accent)" }} />
                  <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)" }}>Sri Lanka Marketplace</span>
                </div>
                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "var(--ink)", margin: 0, lineHeight: 1.1 }}>
                  Find Your Next<br />
                  <span style={{ color: "var(--accent)", fontStyle: "italic" }}>Property</span>
                </h1>
              </div>

              {/* Stats row */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <StatPill icon="🏘" label="Active Listings" value={resultCount !== null ? resultCount : "—"} />
                <StatPill icon="📍" label="Locations" value="50+" />
                <StatPill icon="✅" label="Verified" value="100%" />
              </div>
            </div>
          </div>

          {/* ── Controls bar ── */}
          <div
            className="anim-up-2"
            style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              gap: 12, flexWrap: "wrap",
              background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: "var(--radius)", padding: "12px 18px",
              marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,.05)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {/* Mobile filter trigger */}
              <button
                className="btn-ghost"
                style={{ display: "flex", alignItems: "center", gap: 7 }}
                onClick={() => setShowMobileFilters(true)}
              >
                <HiFilter size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span style={{
                    background: "var(--accent)", color: "#fff", fontSize: 10, fontWeight: 800,
                    borderRadius: 999, minWidth: 18, height: 18, display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                  }}>{activeFilterCount}</span>
                )}
              </button>
              <span style={{ color: "var(--border)", fontSize: 20 }}>|</span>
              <span style={{ fontSize: 12, color: "var(--ink-muted)", fontWeight: 500 }}>
                {loading ? "Loading…" : `${properties.length} listing${properties.length !== 1 ? "s" : ""} found`}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Sort */}
              <div style={{ position: "relative" }}>
                <select
                  value={filters.sort}
                  onChange={(e) => { const u = { ...filters, sort: e.target.value }; setFilters(u); updateURLParams(u); }}
                  className="sort-select"
                  style={{
                    background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: 10,
                    fontSize: 12, fontWeight: 700, color: "var(--ink)", padding: "8px 36px 8px 12px",
                    outline: "none", fontFamily: "inherit",
                  }}
                >
                  <option value="latest">Newest First</option>
                  <option value="price-asc">Price: Low → High</option>
                  <option value="price-desc">Price: High → Low</option>
                </select>
                <HiSelector style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink-muted)" }} size={14} />
              </div>

              {/* View toggle */}
              <div style={{ display: "flex", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 4, gap: 2 }}>
                <button className={`vtog ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")} title="Grid"><HiViewGrid size={16} /></button>
                <button className={`vtog ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")} title="List"><HiViewList size={16} /></button>
              </div>
            </div>
          </div>

          {/* ── Active filter pills ── */}
          <ActiveFilters filters={filters} onRemove={removeFilter} onClearAll={clearAllFilters} />

          {/* ── Body: sidebar + listings ── */}
          <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>

            {/* Desktop sidebar */}
            <aside
              className="anim-up-3"
              style={{
                width: 272, flexShrink: 0,
                background: "var(--card)", border: "1px solid var(--border)",
                borderRadius: "var(--radius)", padding: "22px 20px",
                boxShadow: "0 2px 16px rgba(0,0,0,.04)",
                position: "sticky", top: 88,
                display: "none",  // hidden on mobile, show via media query hack below
              }}
              className="anim-up-3 desktop-sidebar"
            >
              <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: "var(--ink)" }}>Filters</p>
                  <p style={{ margin: 0, fontSize: 11, color: "var(--ink-muted)", fontWeight: 500, marginTop: 2 }}>Refine your search</p>
                </div>
                {activeFilterCount > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", background: "var(--accent-lt)", borderRadius: 8, padding: "3px 9px" }}>
                    {activeFilterCount} active
                  </span>
                )}
              </div>
              <FilterPanel />
            </aside>

            {/* Listings area */}
            <div style={{ flex: 1, minWidth: 0 }} className="anim-up-3">
              {loading ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 20 }}>
                  {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : error ? (
                <div className="empty-box">
                  <div style={{ fontSize: 36, marginBottom: 10 }}>⚠️</div>
                  <p style={{ color: "#ef4444", fontWeight: 700, margin: 0 }}>{error}</p>
                  <button className="btn-accent" style={{ marginTop: 18 }} onClick={() => fetchProperties(filters)}>
                    Retry
                  </button>
                </div>
              ) : properties.length === 0 ? (
                <div className="empty-box">
                  <div style={{ fontSize: 42, marginBottom: 12 }}>🔍</div>
                  <h4 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700, margin: "0 0 8px" }}>No listings found</h4>
                  <p style={{ color: "var(--ink-muted)", fontSize: 13, margin: "0 auto", maxWidth: 320, fontWeight: 500 }}>
                    Try adjusting your search criteria or clearing some filters.
                  </p>
                  {activeFilterCount > 0 && (
                    <button className="btn-accent" style={{ marginTop: 20 }} onClick={clearAllFilters}>
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : (
                <div style={{
                  display: viewMode === "grid" ? "grid" : "flex",
                  gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(260px,1fr))" : undefined,
                  flexDirection: viewMode === "list" ? "column" : undefined,
                  gap: 20,
                }}>
                  {properties.map((property, i) => (
                    <div
                      key={property._id}
                      className="card-wrap"
                      style={{ animation: `fadeUp 0.4s cubic-bezier(.22,1,.36,1) ${i * 0.04}s both` }}
                    >
                      <PropertyCard
                        property={property}
                        isWishlisted={wishlistedIds.includes(String(property._id))}
                        onToggleWishlist={handleToggleWishlist}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile filter sheet ── */}
        {showMobileFilters && (
          <>
            <div className="filter-overlay" onClick={() => setShowMobileFilters(false)} />
            <div className="filter-sheet">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                <h3 style={{ margin: 0, fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 700 }}>Filter Listings</h3>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  style={{ background: "var(--surface)", border: "none", borderRadius: 10, padding: "8px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}
                >
                  <HiX size={18} style={{ color: "var(--ink-muted)" }} />
                </button>
              </div>
              <FilterPanel />
              <button
                className="btn-accent"
                style={{ width: "100%", padding: "14px", borderRadius: 14, fontSize: 14, marginTop: 12 }}
                onClick={() => setShowMobileFilters(false)}
              >
                Show {properties.length} Results
              </button>
            </div>
          </>
        )}

        {/* Make desktop sidebar visible via inline style override */}
        <style>{`
          @media (min-width: 1024px) { .desktop-sidebar { display: block !important; } }
        `}</style>
      </div>
    </>
  );
};

export default Properties;
