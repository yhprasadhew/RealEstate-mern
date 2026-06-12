import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineStar, 
  HiStar, 
  HiOutlineTrash, 
  HiOutlineCheck, 
  HiOutlineInbox, 
  HiOutlineChatAlt2,
  HiOutlineMail
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { adminContactsStyles as s } from "../../assets/dummyStyles";

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/reviews/all");
      if (res.data.success) {
        setReviews(res.data.reviews || []);
      } else {
        setError("Failed to retrieve website reviews");
      }
    } catch (err) {
      console.error("Error retrieving reviews:", err);
      setError(err.response?.data?.message || "Error retrieving reviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleApprove = async (id) => {
    try {
      const res = await api.patch(`/api/reviews/${id}/approve`);
      if (res.data.success) {
        setReviews((prev) =>
          prev.map((r) => (r._id === id ? { ...r, isApproved: true } : r))
        );
      }
    } catch (err) {
      console.error("Error approving review:", err);
      alert(err.response?.data?.message || "Failed to approve review.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      const res = await api.delete(`/api/reviews/${id}`);
      if (res.data.success) {
        setReviews((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (err) {
      console.error("Error deleting review:", err);
      alert(err.response?.data?.message || "Failed to delete review.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<HiStar key={i} className="text-amber-500" size={16} />);
      } else {
        stars.push(<HiOutlineStar key={i} className="text-slate-300" size={16} />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.container}>
        <h1 className={s.heading}>Reviews Moderation</h1>
        <p className={s.subheading}>Manage and moderate reviews submitted by buyers and sellers for the website</p>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchReviews} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Main card wrapper */}
      <div className={s.card}>
        <div className={s.cardHeader}>
          <h2 className={s.cardTitle}>Submitted Reviews</h2>
          <span className="text-sm text-text-muted font-semibold">Total: {reviews.length}</span>
        </div>

        {reviews.length === 0 ? (
          <div className={s.emptyState}>
            <HiOutlineInbox size={48} className={s.emptyIcon} />
            <p>No reviews have been submitted yet.</p>
          </div>
        ) : (
          <div className={s.contactList}>
            {reviews.map((review, index) => {
              const displayRole = review.user?.role || "user";
              const dateStr = review.createdAt 
                ? new Date(review.createdAt).toLocaleDateString()
                : "N/A";

              return (
                <div key={review._id} className={s.contactItem(index, reviews.length)}>
                  <div className={s.contactHeader}>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Avatar */}
                      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0 border border-teal-100">
                        {review.user?.profilePicture ? (
                          <img src={review.user.profilePicture} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          review.user?.name?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                      <div>
                        {/* Name and Role Badge */}
                        <div className={s.nameBadgeContainer}>
                          <h3 className={s.name}>{review.user?.name || "Deleted User"}</h3>
                          <span className={s.roleBadge(displayRole)}>
                            {displayRole}
                          </span>
                          {review.isApproved ? (
                            <span className="text-[0.7rem] px-2 py-0.5 rounded-full font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                              Approved
                            </span>
                          ) : (
                            <span className="text-[0.7rem] px-2 py-0.5 rounded-full font-bold uppercase bg-amber-50 text-amber-600 border border-amber-100 animate-pulse">
                              Pending
                            </span>
                          )}
                        </div>
                        {/* Rating stars & email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                          {renderStars(review.rating)}
                          {review.user?.email && (
                            <div className="flex items-center gap-1 text-xs text-text-muted">
                              <HiOutlineMail size={13} />
                              <span>{review.user.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date and Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-xs text-text-muted">{dateStr}</span>
                      
                      <div className="flex items-center gap-2">
                        {!review.isApproved && (
                          <button
                            onClick={() => handleApprove(review._id)}
                            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Approve Review"
                          >
                            <HiOutlineCheck size={14} /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-xs transition-colors flex items-center justify-center cursor-pointer"
                          title="Delete Review"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Message box */}
                  <div className={s.messageBox}>
                    <p className="whitespace-pre-wrap italic text-slate-700 font-medium">"{review.comment}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviews;
