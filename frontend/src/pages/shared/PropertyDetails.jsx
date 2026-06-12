import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  HiChevronRight, HiHeart, HiLocationMarker, HiOutlineHeart,
  HiPhone, HiEye, HiChat, HiShare, HiX, HiChevronLeft, HiChevronRight as HiChevronRightIcon,
  HiCheckCircle, HiSparkles, HiBadgeCheck,
} from "react-icons/hi";

import Navbar from "../../components/common/Navbar";
import { useAuth } from "../../context/AuthContext";
import API_URL from "../../config";

/* ─── Design tokens & animation styles ───────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,800;1,9..144,400&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:        #0d1117;
    --ink-muted:  #64748b;
    --surface:    #f5f6fa;
    --card:       #ffffff;
    --accent:     #1a6b4a;
    --accent-lt:  #e6f4ed;
    --accent-glow:rgba(26,107,74,0.14);
    --border:     rgba(0,0,0,0.08);
    --radius:     16px;
    --shadow-sm:  0 2px 12px rgba(0,0,0,.06);
    --shadow-md:  0 8px 32px rgba(0,0,0,.10);
  }

  .pd-page { font-family:'DM Sans',sans-serif; background:var(--surface); min-height:100vh; color:var(--ink); }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes shimmer  { 0%,100%{background-position:200% center} 50%{background-position:-200% center} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(.94)} to{opacity:1;transform:none} }
  @keyframes heartPop { 0%{transform:scale(1)} 40%{transform:scale(1.4)} 100%{transform:scale(1)} }

  .au1 { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) both }
  .au2 { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .08s both }
  .au3 { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .15s both }
  .au4 { animation:fadeUp .45s cubic-bezier(.22,1,.36,1) .22s both }

  .skel {
    background:linear-gradient(90deg,#e8eaed 25%,#f4f5f7 50%,#e8eaed 75%);
    background-size:400% 100%;
    animation:shimmer 1.6s ease-in-out infinite;
    border-radius:12px;
  }

  /* Gallery */
  .gallery-main { position:relative; overflow:hidden; border-radius:16px; cursor:zoom-in; }
  .gallery-main img { width:100%; height:100%; object-fit:cover; transition:transform .4s cubic-bezier(.22,1,.36,1); display:block; }
  .gallery-main:hover img { transform:scale(1.03); }
  .gallery-thumb { position:relative; overflow:hidden; border-radius:12px; cursor:pointer; }
  .gallery-thumb img { width:100%; height:100%; object-fit:cover; transition:transform .3s; display:block; }
  .gallery-thumb:hover img { transform:scale(1.05); }
  .gallery-thumb .overlay { position:absolute;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800;font-family:'Fraunces',serif;opacity:0;transition:opacity .2s; }
  .gallery-thumb:hover .overlay { opacity:1; }

  /* Stat cards */
  .stat-pill { background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px 20px;display:flex;flex-direction:column;gap:4px;transition:box-shadow .2s,transform .2s; }
  .stat-pill:hover { box-shadow:var(--shadow-md);transform:translateY(-2px); }

  /* Tabs */
  .tab-btn { background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:700;padding:10px 18px;border-radius:10px;transition:all .2s;color:var(--ink-muted); }
  .tab-btn.active { background:var(--accent);color:#fff;box-shadow:0 4px 14px var(--accent-glow); }

  /* Amenity chip */
  .amenity-chip { display:inline-flex;align-items:center;gap:8px;padding:8px 14px;background:var(--accent-lt);border:1px solid rgba(26,107,74,.2);border-radius:10px;font-size:12px;font-weight:600;color:var(--accent); }

  /* Sidebar card */
  .sidebar-card { background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;box-shadow:var(--shadow-sm); }

  /* Price card gradient */
  .price-card { background:linear-gradient(135deg,#0d4a32 0%,#1a6b4a 60%,#22c55e 130%);border-radius:var(--radius);padding:28px;position:relative;overflow:hidden; }
  .price-card::before { content:'';position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,.07);pointer-events:none; }
  .price-card::after  { content:'';position:absolute;bottom:-30px;left:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,.05);pointer-events:none; }

  /* CTA buttons */
  .btn-primary { background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;padding:13px 22px;cursor:pointer;transition:filter .15s,transform .1s,box-shadow .15s;box-shadow:0 4px 16px var(--accent-glow);display:flex;align-items:center;justify-content:center;gap:8px; }
  .btn-primary:hover { filter:brightness(1.08);box-shadow:0 6px 22px var(--accent-glow); }
  .btn-primary:active { transform:scale(.97); }

  .btn-secondary { background:var(--card);color:var(--ink);border:1.5px solid var(--border);border-radius:12px;font-family:'DM Sans',sans-serif;font-weight:700;font-size:14px;padding:12px 22px;cursor:pointer;transition:border-color .15s,box-shadow .15s;display:flex;align-items:center;justify-content:center;gap:8px; }
  .btn-secondary:hover { border-color:var(--accent);color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow); }

  /* Wishlist btn */
  .wishlist-btn { width:44px;height:44px;border-radius:12px;border:1.5px solid var(--border);background:var(--card);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s; }
  .wishlist-btn.active { background:#fef2f2;border-color:#fca5a5;animation:heartPop .35s ease; }
  .wishlist-btn:hover { border-color:var(--accent); }

  /* Seller avatar ring */
  .seller-avatar { width:52px;height:52px;border-radius:14px;overflow:hidden;border:2px solid var(--accent-lt);flex-shrink:0; }

  /* Inquiry textarea */
  .inquiry-ta { width:100%;box-sizing:border-box;resize:none;border:1.5px solid var(--border);border-radius:12px;padding:12px 14px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500;color:var(--ink);background:var(--surface);outline:none;transition:border-color .2s,box-shadow .2s;min-height:96px; }
  .inquiry-ta:focus { border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow); }

  /* Lightbox */
  .lightbox { position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:1000;display:flex;align-items:center;justify-content:center;animation:fadeIn .2s ease; }
  .lightbox-inner { position:relative;max-width:90vw;max-height:90vh;animation:scaleIn .25s cubic-bezier(.22,1,.36,1); }
  .lightbox-inner img { max-width:90vw;max-height:85vh;object-fit:contain;border-radius:16px;display:block; }
  .lb-btn { position:absolute;top:50%;transform:translateY(-50%);background:rgba(255,255,255,.15);border:none;color:#fff;width:44px;height:44px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;transition:background .2s;backdrop-filter:blur(8px); }
  .lb-btn:hover { background:rgba(255,255,255,.3); }
  .lb-prev { left:-58px; }
  .lb-next { right:-58px; }
  .lb-close { position:fixed;top:20px;right:24px;background:rgba(255,255,255,.15);border:none;color:#fff;width:40px;height:40px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);transition:background .2s; }
  .lb-close:hover { background:rgba(255,255,255,.3); }
  .lb-counter { position:absolute;bottom:-36px;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.6);font-size:12px;font-weight:600;white-space:nowrap; }

  /* Similar card */
  .sim-card { background:var(--card);border:1px solid var(--border);border-radius:var(--radius);overflow:hidden;transition:transform .2s,box-shadow .2s; }
  .sim-card:hover { transform:translateY(-4px);box-shadow:var(--shadow-md); }
  .sim-card img { width:100%;height:180px;object-fit:cover;display:block;transition:transform .4s; }
  .sim-card:hover img { transform:scale(1.04); }

  /* Details table */
  .detail-row { display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--border); }
  .detail-row:last-child { border-bottom:none; }

  /* Breadcrumb */
  .breadcrumb { display:flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:var(--ink-muted); }
  .breadcrumb a { color:var(--ink-muted);text-decoration:none;transition:color .15s; }
  .breadcrumb a:hover { color:var(--accent); }

  /* badge */
  .badge { display:inline-flex;align-items:center;gap:5px;padding:4px 11px;border-radius:999px;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase; }
  .badge-green { background:var(--accent-lt);color:var(--accent);border:1px solid rgba(26,107,74,.2); }
  .badge-blue  { background:#eff6ff;color:#2563eb;border:1px solid rgba(37,99,235,.2); }

  /* section title */
  .sec-title { font-family:'Fraunces',serif;font-size:20px;font-weight:700;color:var(--ink);margin:0 0 16px; }

  /* scroll dots */
  .img-dot { width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,.4);border:none;cursor:pointer;transition:all .2s;padding:0; }
  .img-dot.active { background:#fff;width:18px;border-radius:3px; }

  @media(max-width:768px) {
    .lb-prev { left:-16px; }
    .lb-next { right:-16px; }
    .lb-close { top:12px;right:12px; }
  }
`;

/* ─── Skeleton loader ───────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "32px 20px" }}>
      <div className="skel" style={{ height: 14, width: 260, marginBottom: 28 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
        <div>
          <div className="skel" style={{ height: 420, marginBottom: 12 }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
            {[0,1,2].map(i => <div key={i} className="skel" style={{ height: 110 }} />)}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="skel" style={{ height: 220 }} />
          <div className="skel" style={{ height: 300 }} />
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Main
   ══════════════════════════════════════════════════════════════════ */
const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [property, setProperty]             = useState(null);
  const [similarProperties, setSimilar]     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [isInWishlist, setIsInWishlist]     = useState(false);
  const [wishAnim, setWishAnim]             = useState(false);
  const [lightboxIndex, setLightboxIndex]   = useState(null);
  const [activeTab, setActiveTab]           = useState("overview");
  const [inquiry, setInquiry]               = useState({ message: "" });
  const [inquiryStatus, setInquiryStatus]   = useState({ loading:false, success:false, error:null });
  const [copied, setCopied]                 = useState(false);
  const mainImageRef                        = useRef(null);

  /* fetch */
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        setLoading(true); setError(null);
        const res = await axios.get(`${API_URL}/api/property/${id}`);
        if (!alive) return;
        setProperty(res.data.property || null);
        setSimilar(res.data.similarProperties || []);
        if (user && token) {
          const wr = await axios.get(`${API_URL}/api/wishlist`, { headers:{ Authorization:`Bearer ${token}` } });
          setIsInWishlist(wr.data.some(i => i.property?._id === id));
        }
      } catch (e) {
        if (alive) setError(e.response?.data?.message || "Failed to load property.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [id, token, user]);

  const handleWishlistToggle = async () => {
    if (!user) { navigate("/login"); return; }
    setWishAnim(true); setTimeout(() => setWishAnim(false), 350);
    setIsInWishlist(p => !p);
    try {
      if (isInWishlist) await axios.delete(`${API_URL}/api/wishlist/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
      else              await axios.post(`${API_URL}/api/wishlist/${id}`, {}, { headers:{ Authorization:`Bearer ${token}` } });
    } catch { setIsInWishlist(p => !p); }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (user.role !== "buyer") { alert("Only buyers can send inquiries."); return; }
    setInquiryStatus({ loading:true, success:false, error:null });
    try {
      await axios.post(`${API_URL}/api/inquiry`,
        { propertyId:id, message:inquiry.message, name:user.name, email:user.email, phone:user.phone||"" },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      setInquiryStatus({ loading:false, success:true, error:null });
      setInquiry({ message:"" });
    } catch (e) {
      setInquiryStatus({ loading:false, success:false, error:e.response?.data?.message||"Failed to send." });
    }
  };

  const handleStartChat = async () => {
    if (!user) { navigate("/login"); return; }
    if (user.role !== "buyer") { alert("Only buyers can start a chat."); return; }
    if (!property?.seller?._id) { alert("Seller information unavailable."); return; }
    try {
      const res = await axios.post(`${API_URL}/api/chat/start`,
        { propertyId:id, sellerId:property.seller._id },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      const chat = res.data?.chat || res.data;
      await axios.post(`${API_URL}/api/chat/send`,
        { chatId:chat._id, text:`Interested in: ${property.title}`, image:property.images?.[0]||"" },
        { headers:{ Authorization:`Bearer ${token}` } }
      );
      navigate("/chat-messages", { state:{ chat } });
    } catch (e) { alert(e.response?.data?.message || "Failed to start chat."); }
  };

  const fmt = (v) => new Intl.NumberFormat("en-LK", { style:"currency", currency:"LKR", maximumFractionDigits:0 }).format(Number(v)||0);

  const images = property?.images?.length
    ? property.images
    : ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80"];

  const openLightbox  = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);
  const nextImg = () => setLightboxIndex(p => (p+1) % images.length);
  const prevImg = () => setLightboxIndex(p => (p-1+images.length) % images.length);

  /* keyboard nav for lightbox */
  useEffect(() => {
    if (lightboxIndex === null) return;
    const h = (e) => { if (e.key==="ArrowRight") nextImg(); if (e.key==="ArrowLeft") prevImg(); if (e.key==="Escape") closeLightbox(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightboxIndex]);

  if (loading) return (<><style>{STYLES}</style><div className="pd-page"><Navbar /><PageSkeleton /></div></>);

  if (error || !property) return (
    <><style>{STYLES}</style>
    <div className="pd-page"><Navbar />
      <div style={{ textAlign:"center", padding:"80px 20px" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🏚</div>
        <p style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, marginBottom:8 }}>{error||"Property not found"}</p>
        <button className="btn-primary" style={{ display:"inline-flex", marginTop:12 }} onClick={() => navigate("/properties")}>Back to Listings</button>
      </div>
    </div></>
  );

  const tabs = [
    { key:"overview",  label:"Overview" },
    { key:"details",   label:"Details" },
    { key:"amenities", label:"Amenities" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="pd-page">
        <Navbar />

        <div style={{ maxWidth:1300, margin:"0 auto", padding:"32px 20px 72px" }}>

          {/* ── Breadcrumb ── */}
          <nav className="breadcrumb au1" style={{ marginBottom:24 }}>
            <Link to="/">Home</Link>
            <HiChevronRight size={13} />
            <Link to="/properties">Listings</Link>
            <HiChevronRight size={13} />
            <span style={{ color:"var(--ink)", fontWeight:700 }}>{property.title}</span>
          </nav>

          {/* ── Main two-column layout ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 340px", gap:32, alignItems:"start" }}>

            {/* ════ LEFT COLUMN ════ */}
            <div>
              {/* Title row */}
              <div className="au1" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16, marginBottom:20, flexWrap:"wrap" }}>
                <div>
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                    <span className="badge badge-green"><HiSparkles size={10} />Featured</span>
                    {property.status && (
                      <span className="badge badge-blue">{property.status === "rent" ? "For Rent" : "For Sale"}</span>
                    )}
                    {property.propertyType && (
                      <span style={{ fontSize:11, color:"var(--ink-muted)", fontWeight:600, textTransform:"uppercase", letterSpacing:".08em" }}>{property.propertyType}</span>
                    )}
                  </div>
                  <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:"clamp(22px,3vw,32px)", fontWeight:800, color:"var(--ink)", margin:"0 0 10px", lineHeight:1.2 }}>
                    {property.title}
                  </h1>
                  <div style={{ display:"flex", alignItems:"center", gap:6, color:"var(--ink-muted)", fontSize:13, fontWeight:600 }}>
                    <HiLocationMarker size={15} style={{ color:"var(--accent)", flexShrink:0 }} />
                    {property.city}{property.area ? `, ${property.area}` : ""}
                  </div>
                </div>

                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button
                    className={`wishlist-btn${isInWishlist?" active":""}`}
                    onClick={handleWishlistToggle}
                    title="Save to wishlist"
                  >
                    {isInWishlist
                      ? <HiHeart size={19} style={{ color:"#ef4444" }} />
                      : <HiOutlineHeart size={19} style={{ color:"var(--ink-muted)" }} />}
                  </button>
                  <button className="wishlist-btn" onClick={handleShare} title={copied?"Copied!":"Share"}>
                    {copied
                      ? <HiCheckCircle size={19} style={{ color:"var(--accent)" }} />
                      : <HiShare size={18} style={{ color:"var(--ink-muted)" }} />}
                  </button>
                </div>
              </div>

              {/* Gallery */}
              <div className="au2" style={{ marginBottom: 24 }}>
                {images.length === 1 ? (
                  <div className="gallery-main" style={{ height: 400 }} onClick={() => openLightbox(0)}>
                    <img src={images[0]} alt={property.title} />
                  </div>
                ) : images.length === 2 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, height: 400 }}>
                    <div className="gallery-main" onClick={() => openLightbox(0)}>
                      <img src={images[0]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-main" onClick={() => openLightbox(1)}>
                      <img src={images[1]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ) : images.length === 3 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "195px 195px", gap: 10, height: 400 }}>
                    <div className="gallery-main" style={{ gridRow: "1 / 3" }} onClick={() => openLightbox(0)}>
                      <img src={images[0]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(1)}>
                      <img src={images[1]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(2)}>
                      <img src={images[2]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ) : images.length === 4 ? (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "195px 195px", gap: 10, height: 400 }}>
                    <div className="gallery-main" style={{ gridRow: "1 / 3" }} onClick={() => openLightbox(0)}>
                      <img src={images[0]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(1)}>
                      <img src={images[1]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(2)}>
                      <img src={images[2]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" style={{ gridColumn: "2 / span 2" }} onClick={() => openLightbox(3)}>
                      <img src={images[3]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gridTemplateRows: "195px 195px", gap: 10, height: 400 }}>
                    <div className="gallery-main" style={{ gridRow: "1 / 3" }} onClick={() => openLightbox(0)}>
                      <img src={images[0]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(1)}>
                      <img src={images[1]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(2)}>
                      <img src={images[2]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(3)}>
                      <img src={images[3]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                    </div>
                    <div className="gallery-thumb" onClick={() => openLightbox(4)}>
                      <img src={images[4]} alt={property.title} style={{ height: "100%", width: "100%", objectFit: "cover" }} />
                      {images.length > 5 && (
                        <div className="overlay" style={{ opacity: 1, background: "rgba(0,0,0,0.55)" }}>
                          +{images.length - 4} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Stat pills */}
              <div className="au3" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:28 }}>
                {[
                  { icon:"🏠", label:"Type",      value:property.propertyType||"—" },
                  { icon:"🛏", label:"Bedrooms",  value:property.bhk ? `${property.bhk} BHK` : "—" },
                  { icon:"🚿", label:"Bathrooms", value:property.bathrooms||"—" },
                  { icon:"👁", label:"Views",     value:property.views||0 },
                ].map(s => (
                  <div key={s.label} className="stat-pill">
                    <span style={{ fontSize:20 }}>{s.icon}</span>
                    <span style={{ fontSize:15, fontWeight:800, color:"var(--ink)", fontFamily:"'Fraunces',serif" }}>{s.value}</span>
                    <span style={{ fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:".08em", color:"var(--ink-muted)" }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="au4">
                <div style={{ display:"flex", gap:6, background:"var(--surface)", padding:6, borderRadius:14, width:"fit-content", marginBottom:24, border:"1px solid var(--border)" }}>
                  {tabs.map(t => (
                    <button key={t.key} className={`tab-btn${activeTab===t.key?" active":""}`} onClick={() => setActiveTab(t.key)}>
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Overview tab */}
                {activeTab === "overview" && (
                  <div style={{ animation:"fadeUp .3s ease both" }}>
                    <div style={{ background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px 28px", boxShadow:"var(--shadow-sm)" }}>
                      <h2 className="sec-title">About this property</h2>
                      <p style={{ fontSize:14, lineHeight:1.8, color:"var(--ink-muted)", fontWeight:500, margin:0 }}>
                        {property.description || "No description available for this listing."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Details tab */}
                {activeTab === "details" && (
                  <div style={{ animation:"fadeUp .3s ease both", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px 28px", boxShadow:"var(--shadow-sm)" }}>
                    <h2 className="sec-title">Property Details</h2>
                    {[
                      { label:"Status",        value:property.status||"Available" },
                      { label:"Price",         value:fmt(property.price) },
                      { label:"City",          value:property.city||"—" },
                      { label:"Area",          value:property.area||"—" },
                      { label:"BHK",           value:property.bhk||"—" },
                      { label:"Bathrooms",     value:property.bathrooms||0 },
                      { label:"Property Type", value:property.propertyType||"—" },
                      { label:"Furnishing",    value:property.furnishing||"—" },
                    ].map(row => (
                      <div key={row.label} className="detail-row">
                        <span style={{ fontSize:13, fontWeight:600, color:"var(--ink-muted)" }}>{row.label}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Amenities tab */}
                {activeTab === "amenities" && (
                  <div style={{ animation:"fadeUp .3s ease both", background:"var(--card)", border:"1px solid var(--border)", borderRadius:"var(--radius)", padding:"24px 28px", boxShadow:"var(--shadow-sm)" }}>
                    <h2 className="sec-title">Amenities & Facilities</h2>
                    {property.facilities?.length ? (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:10 }}>
                        {property.facilities.map(f => (
                          <span key={f} className="amenity-chip">
                            <HiCheckCircle size={14} /> {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color:"var(--ink-muted)", fontSize:13, fontWeight:500 }}>No amenities listed.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ════ RIGHT SIDEBAR ════ */}
            <div style={{ display:"flex", flexDirection:"column", gap:16, position:"sticky", top:88 }}>

              {/* Price card */}
              <div className="price-card au2">
                <div style={{ fontSize:11, fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"rgba(255,255,255,.6)", marginBottom:6 }}>
                  {property.status === "rent" ? "Monthly Rent" : "Asking Price"}
                </div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:32, fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:4 }}>
                  {fmt(property.price)}
                </div>
                <div style={{ fontSize:12, color:"rgba(255,255,255,.5)", fontWeight:600, marginBottom:20 }}>
                  {property.status === "rent" ? "per month" : "one-time"}
                </div>
                <div style={{ borderTop:"1px solid rgba(255,255,255,.15)", paddingTop:16, display:"flex", flexDirection:"column", gap:8 }}>
                  {[["City", property.city], ["Area", property.area||"—"], ["Type", property.propertyType||"—"]].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                      <span style={{ color:"rgba(255,255,255,.55)", fontWeight:600 }}>{k}</span>
                      <span style={{ color:"#fff", fontWeight:700 }}>{v}</span>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:16, display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,.15)", borderRadius:999, padding:"5px 12px", fontSize:11, fontWeight:700, color:"#fff" }}>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                  {property.status || "Available"}
                </div>
              </div>

              {/* Seller + actions card */}
              <div className="sidebar-card au3" style={{ padding:22 }}>

                {/* Seller */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18, paddingBottom:18, borderBottom:"1px solid var(--border)" }}>
                  <div className="seller-avatar">
                    {property.seller?.profilePic
                      ? <img src={property.seller.profilePic} alt={property.seller.name} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <div style={{ width:"100%", height:"100%", background:"linear-gradient(135deg,#d1fae5,#a7f3d0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🏡</div>
                    }
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <Link to={`/seller/${property.seller?._id||""}`} style={{ textDecoration:"none" }}>
                      <div style={{ fontSize:14, fontWeight:800, color:"var(--ink)", display:"flex", alignItems:"center", gap:5 }}>
                        {property.seller?.name||"Seller"}
                        <HiBadgeCheck size={15} style={{ color:"var(--accent)", flexShrink:0 }} />
                      </div>
                    </Link>
                    <div style={{ fontSize:11, color:"var(--ink-muted)", fontWeight:600, marginTop:2 }}>Verified Seller</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
                  <button className="btn-primary" onClick={handleStartChat}>
                    <HiChat size={16} /> Start Chat
                  </button>
                  <a href={`tel:${property.seller?.phone||""}`} className="btn-secondary" style={{ textDecoration:"none" }}>
                    <HiPhone size={16} /> Call Seller
                  </a>
                </div>

                {/* Inquiry form */}
                <div>
                  <div style={{ fontSize:11, fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"var(--ink-muted)", marginBottom:10 }}>Send Inquiry</div>
                  {user ? (
                    <form onSubmit={handleInquirySubmit}>
                      <textarea
                        className="inquiry-ta"
                        value={inquiry.message}
                        onChange={e => setInquiry(p => ({ ...p, message:e.target.value }))}
                        placeholder="Tell the seller what you're looking for…"
                      />
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ width:"100%", marginTop:10 }}
                        disabled={inquiryStatus.loading || !inquiry.message.trim()}
                      >
                        {inquiryStatus.loading ? "Sending…" : "Send Inquiry"}
                      </button>
                      {inquiryStatus.success && (
                        <div style={{ display:"flex", alignItems:"center", gap:7, marginTop:10, color:"var(--accent)", fontSize:12, fontWeight:700 }}>
                          <HiCheckCircle size={15} /> Inquiry sent successfully!
                        </div>
                      )}
                      {inquiryStatus.error && (
                        <p style={{ color:"#ef4444", fontSize:12, marginTop:8, fontWeight:600 }}>{inquiryStatus.error}</p>
                      )}
                    </form>
                  ) : (
                    <div style={{ textAlign:"center", padding:"18px 0" }}>
                      <p style={{ fontSize:13, color:"var(--ink-muted)", fontWeight:500, marginBottom:12 }}>
                        Sign in as a buyer to contact the seller.
                      </p>
                      <button className="btn-primary" style={{ margin:"0 auto" }} onClick={() => navigate("/login")}>Login</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Similar properties ── */}
          {similarProperties.length > 0 && (
            <div style={{ marginTop:60 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:24, flexWrap:"wrap", gap:12 }}>
                <div>
                  <h2 style={{ fontFamily:"'Fraunces',serif", fontSize:26, fontWeight:800, margin:"0 0 4px" }}>Similar Properties</h2>
                  <p style={{ fontSize:13, color:"var(--ink-muted)", fontWeight:500, margin:0 }}>Matching listings in the same area</p>
                </div>
                <Link to="/properties" style={{ fontSize:13, fontWeight:700, color:"var(--accent)", textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
                  Browse all <HiChevronRightIcon size={15} />
                </Link>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:18 }}>
                {similarProperties.map((item, i) => (
                  <Link key={item._id} to={`/properties/${item._id}`} style={{ textDecoration:"none" }}>
                    <div className="sim-card" style={{ animation:`fadeUp .4s ease ${i*.07}s both` }}>
                      <img src={item.images?.[0]||"https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80"} alt={item.title} />
                      <div style={{ padding:"16px 18px" }}>
                        <div style={{ fontSize:10, fontWeight:800, letterSpacing:".1em", textTransform:"uppercase", color:"var(--accent)", marginBottom:6 }}>{item.propertyType}</div>
                        <div style={{ fontFamily:"'Fraunces',serif", fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:6, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{item.title}</div>
                        <div style={{ fontSize:12, color:"var(--ink-muted)", fontWeight:500, marginBottom:12 }}>{item.city}{item.area?`, ${item.area}`:""}</div>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                          <span style={{ fontSize:14, fontWeight:800, color:"var(--ink)", fontFamily:"'Fraunces',serif" }}>{fmt(item.price)}</span>
                          <span style={{ fontSize:11, fontWeight:700, color:"var(--accent)" }}>View →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Lightbox ── */}
        {lightboxIndex !== null && (
          <div className="lightbox" onClick={closeLightbox}>
            <button className="lb-close" onClick={closeLightbox}><HiX size={18} /></button>
            <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
              <button className="lb-btn lb-prev" onClick={prevImg}><HiChevronLeft size={20} /></button>
              <img src={images[lightboxIndex]} alt="Property" />
              <button className="lb-btn lb-next" onClick={nextImg}><HiChevronRightIcon size={20} /></button>
              <div className="lb-counter">{lightboxIndex+1} / {images.length}</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyDetails;
