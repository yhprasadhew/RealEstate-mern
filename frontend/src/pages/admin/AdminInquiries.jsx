import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineHome, 
  HiOutlineCalendar, 
  HiOutlineChat, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineUser, 
  HiOutlineInformationCircle 
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { adminInquiriesStyles as s } from "../../assets/dummyStyles";

const AdminInquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/inquiries");
      if (res.data.success) {
        setInquiries(res.data.inquiries);
      } else {
        setError("Failed to retrieve system inquiries");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error retrieving inquiries");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  if (loading && inquiries.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.headerContainer}>
        <h1 className={s.headerTitle}>System Inquiries</h1>
        <p className={s.headerSubtitle}>Monitor messages sent between prospective buyers and listing sellers</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchInquiries} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {inquiries.length === 0 ? (
        <div className={s.emptyState}>
          <div className={s.emptyIconWrapper}>
            <HiOutlineInformationCircle size={48} className="mx-auto opacity-30" />
          </div>
          <p className={s.emptyText}>No user inquiries recorded on the platform yet.</p>
        </div>
      ) : (
        <div className={s.listContainer}>
          {inquiries.map((inquiry) => {
            const property = inquiry.property || {};
            const buyer = inquiry.buyer || {};
            const seller = inquiry.seller || {};

            return (
              <div key={inquiry._id} className={s.inquiryCard}>
                {/* Top section: Property Info and Date */}
                <div className={s.cardTopSection}>
                  <div className={s.propertyInfoWrapper}>
                    <div className={s.propertyIconWrapper}>
                      <HiOutlineHome size={22} />
                    </div>
                    <div className={s.propertyTextWrapper}>
                      <h4 className={s.propertyTitle}>
                        {property.title || "Deleted Property listing"}
                      </h4>
                      <span className={s.propertyId}>Property ID: {property._id || "N/A"}</span>
                    </div>
                  </div>
                  <div className={s.dateWrapper}>
                    <HiOutlineCalendar size={16} className={s.dateIcon} />
                    <span>Inquired on {new Date(inquiry.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Details section: Buyer and Seller information cards */}
                <div className={s.detailsGrid}>
                  {/* Buyer details card */}
                  <div className={s.detailCard}>
                    <h5 className={s.detailLabel}>Sender (Prospective Buyer)</h5>
                    <p className={s.detailName}>{buyer.name || "Unknown User"}</p>
                    <p className={s.detailEmail}>
                      <HiOutlineMail size={14} className="inline mr-1" />
                      {buyer.email || "No email"}
                    </p>
                    {buyer.phone && (
                      <p className={s.detailEmail + " mt-1"}>
                        <HiOutlinePhone size={14} className="inline mr-1" />
                        {buyer.phone}
                      </p>
                    )}
                  </div>

                  {/* Seller details card */}
                  <div className={s.detailCard}>
                    <h5 className={s.detailLabel}>Recipient (Listing Seller)</h5>
                    <p className={s.detailName}>{seller.name || "Unknown User"}</p>
                    <p className={s.detailEmail}>
                      <HiOutlineMail size={14} className="inline mr-1" />
                      {seller.email || "No email"}
                    </p>
                    {seller.phone && (
                      <p className={s.detailEmail + " mt-1"}>
                        <HiOutlinePhone size={14} className="inline mr-1" />
                        {seller.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Message section */}
                <div className={s.messageContainer}>
                  <div className={s.messageHeader}>
                    <HiOutlineChat size={16} />
                    <span>INQUIRY MESSAGE</span>
                  </div>
                  <p className={s.messageText}>
                    "{inquiry.message || "No message content was entered."}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminInquiries;
