import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineClock, 
  HiOutlineCheck, 
  HiOutlineChatAlt2, 
  HiOutlineUserCircle 
} from "react-icons/hi";

import { api } from "../../context/AuthContext";
import { myInquiriesStyles as s } from "../../assets/dummyStyles";

const SellerInquiries = () => {
  const navigate = useNavigate();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingId, setMarkingId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/inquiry/seller");
      if (res.data.success) {
        setInquiries(res.data.inquiries);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to retrieve inquiries.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  // Mark inquiry as read
  const handleMarkAsRead = async (inquiryId) => {
    setMarkingId(inquiryId);
    try {
      const res = await api.patch(`/api/inquiry/${inquiryId}/read`);
      if (res.data.success) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq._id === inquiryId ? { ...inq, isRead: true } : inq
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update inquiry.");
    } finally {
      setMarkingId(null);
    }
  };

  // Start live chat with the buyer
  const handleReplyChat = async (propertyId, buyerId) => {
    try {
      const res = await api.post("/api/chat/start", {
        propertyId,
        buyerId
      });
      if (res.data.success) {
        navigate("/chat-messages", { state: { chat: res.data.chat } });
      }
    } catch (err) {
      alert("Failed to start chat with buyer.");
    }
  };

  if (loading && inquiries.length === 0) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className={s.containerFadeIn + " max-w-7xl mx-auto p-4 md:p-6"}>
      {/* Header */}
      <div className={s.mb12}>
        <h1 className={s.heading}>Buyer Inquiries</h1>
        <p className={s.textMuted}>Manage inquiry inquiries (Leads) from interested buyers</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchInquiries} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className={s.cardPremiumPy24Px8TextCenter}>
          <div className={s.iconContainer}>
            <HiOutlineUserCircle size={48} />
          </div>
          <h3 className={s.mb4}>No Inquiries Yet</h3>
          <p className={s.textMutedMb8}>Buyers' inquiries regarding your listed properties will show up here.</p>
        </div>
      ) : (
        <div className={s.flexColGap6}>
          {inquiries.map((inq) => (
            <div key={inq._id} className={s.inquiryCard}>
              <div className={s.inquiryMain}>
                {/* Icon wrapper */}
                <div className={s.iconWrapper}>
                  <HiOutlineChatAlt2 className={s.iconSize} />
                </div>

                {/* Main Content */}
                <div className={s.flex1}>
                  <div className={s.titleRow}>
                    <h3 className={s.titleText}>
                      Inquiry for: <span className="text-primary">{inq.property?.title || "Property"}</span>
                    </h3>
                    <span className={`${s.badge} ${inq.isRead ? s.badgeRead : s.badgeNew}`}>
                      {inq.isRead ? "Read" : "New"}
                    </span>
                  </div>

                  {/* Buyer Details */}
                  <div className={s.buyerInfo}>
                    <div className={s.infoItem}>
                      <span className={s.textMutedSmall}>Buyer:</span>
                      <span className={s.fontSemibold}>{inq.buyer?.name}</span>
                    </div>
                    <div className={s.infoItem}>
                      <HiOutlineMail size={16} className="text-[#94a3b8]" />
                      <span>{inq.buyer?.email}</span>
                    </div>
                    {inq.buyer?.phone && (
                      <div className={s.infoItem}>
                        <HiOutlinePhone size={16} className="text-[#94a3b8]" />
                        <span>{inq.buyer?.phone}</span>
                      </div>
                    )}
                    {inq.property?.price && (
                      <div className={s.infoItem}>
                        <span className={s.textMutedSmall}>Listing Price:</span>
                        <span className="font-bold text-primary">₹{inq.property.price.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                  </div>

                  {/* Buyer Message */}
                  <blockquote className={s.message}>
                    "{inq.message}"
                  </blockquote>

                  {/* Timestamp */}
                  <div className={s.meta}>
                    <div className={s.flexItemsCenterGap2}>
                      <HiOutlineClock size={14} />
                      <span>Received {new Date(inq.createdAt).toLocaleDateString()} at {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions side */}
              <div className={s.actions}>
                {!inq.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(inq._id)}
                    disabled={markingId === inq._id}
                    className={s.btnPrimaryWhitespaceNowrap}
                  >
                    <HiOutlineCheck size={18} className="mr-1 inline" />
                    <span>{markingId === inq._id ? "Processing..." : "Mark Read"}</span>
                  </button>
                )}

                <button
                  onClick={() => handleReplyChat(inq.property?._id, inq.buyer?._id)}
                  className={s.btnOutline}
                >
                  <HiOutlineChatAlt2 size={18} className="mr-1 inline" />
                  <span>Start Chat</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerInquiries;
