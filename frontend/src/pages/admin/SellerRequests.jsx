import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineCalendar, 
  HiCheck, 
  HiOutlineUserCircle
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { sellerRequestsStyles as s } from "../../assets/dummyStyles";

const SellerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingId, setApprovingId] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/pending-sellers");
      if (res.data.success) {
        setRequests(res.data.sellers);
      } else {
        setError("Failed to fetch pending seller registrations");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching seller requests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (sellerId) => {
    if (!window.confirm("Approve this seller account? They will be granted permissions to list properties immediately.")) return;

    setApprovingId(sellerId);
    try {
      const res = await api.patch(`/api/admin/sellers/${sellerId}/approve`);
      if (res.data.success) {
        setRequests((prev) => prev.filter((item) => item._id !== sellerId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve seller");
    } finally {
      setApprovingId(null);
    }
  };

  if (loading && requests.length === 0) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.headerContainer}>
        <h1 className={s.pageTitle}>Seller Approvals</h1>
        <p className={s.pageSubtitle}>Review and approve registrations for seller accounts</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchRequests} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Main card wrapper */}
      <div className={s.card}>
        <div className={s.cardInner}>
          <h2 className={s.sectionTitle}>Pending Requests</h2>

          {requests.length === 0 ? (
            <div className={s.emptyState}>
              <HiOutlineUserCircle size={48} className={s.emptyStateIcon} />
              <p>No pending seller requests at this moment.</p>
            </div>
          ) : (
            <div className={s.requestGrid}>
              {requests.map((seller) => (
                <div key={seller._id} className={s.requestCard}>
                  {/* Header */}
                  <div className={s.requestHeader}>
                    <div className={s.avatar}>
                      {seller.name?.[0]?.toUpperCase() || "S"}
                    </div>
                    <div>
                      <h3 className={s.requestName}>{seller.name}</h3>
                      {seller.createdAt && (
                        <div className={s.requestDate}>
                          <HiOutlineCalendar size={14} />
                          <span>Registered {new Date(seller.createdAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact info list */}
                  <div className={s.contactInfo}>
                    <div className={s.contactItem} title="Email Address">
                      <HiOutlineMail size={18} className="text-text-muted" />
                      <span>{seller.email}</span>
                    </div>
                    {seller.phone && (
                      <div className={s.contactItem} title="Phone Number">
                        <HiOutlinePhone size={18} className="text-text-muted" />
                        <span>{seller.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleApprove(seller._id)}
                    disabled={approvingId === seller._id}
                    className={s.approveButton}
                  >
                    <HiCheck size={18} />
                    <span>{approvingId === seller._id ? "Approving..." : "Approve Seller"}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SellerRequests;
