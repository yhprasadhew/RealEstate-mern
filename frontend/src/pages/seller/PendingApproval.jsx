import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiClock, HiRefresh } from "react-icons/hi";

import { pendingApprovalStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";

const PendingApproval = () => {
  const { refreshUser } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState("");

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage("");
    try {
      const result = await refreshUser();
      if (result.success) {
        if (result.user?.isApproved) {
          setMessage("Congratulations! Your account is approved. Please refresh the page.");
        } else {
          setMessage("Your account is still pending approval.");
        }
      } else {
        setMessage(result.message || "Failed to refresh status.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error checking approval status.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className={s.container}>
      <div className={s.iconCircle}>
        <HiClock size={48} />
      </div>

      <h1 className={s.heading}>Approval Pending</h1>

      <p className={s.description}>
        Your seller account is currently pending admin approval. 
        Once approved, you will have full access to listing creation, 
        buyer messages, and analytics dashboards.
      </p>

      {message && (
        <p className={`mb-6 text-sm font-semibold text-center ${message.includes("Congratulations") ? "text-green-600" : "text-primary"}`}>
          {message}
        </p>
      )}

      <div className={s.buttonGroup}>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className={`${s.refreshButtonBase} ${isRefreshing ? s.refreshButtonDisabled : s.refreshButtonEnabled}`}
        >
          <HiRefresh size={20} className={isRefreshing ? "animate-spin" : ""} />
          {isRefreshing ? "Checking..." : "Refresh Status"}
        </button>

        <Link to="/" className={s.browseButton}>
          Back to Homepage
        </Link>
      </div>

      <div className={s.supportContainer}>
        <span>Need help? Contact support at</span>
        <a href="mailto:support@realestate.com" className={s.supportLink}>
          support@realestate.com
        </a>
      </div>
    </div>
  );
};

export default PendingApproval;