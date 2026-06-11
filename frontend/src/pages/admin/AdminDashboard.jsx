import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineUsers, 
  HiOutlineLibrary, 
  HiOutlineChatAlt2, 
  HiOutlineBan, 
  HiOutlineRefresh, 
  HiOutlineShieldCheck,
  HiOutlineTrash,
  HiOutlineUserCircle
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { adminDashboardStyles as s } from "../../assets/dummyStyles";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/stats");
      if (res.data.success) {
        setStats(res.data.stats);
      } else {
        setError("Failed to retrieve dashboard stats");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading && !stats) {
    return (
      <div className={s.loaderFullPage}>
        <div className={s.loader}></div>
      </div>
    );
  }

  const statItems = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: HiOutlineUsers,
      color: "bg-[#eff6ff] text-[#2563eb]"
    },
    {
      title: "Active Properties",
      value: stats?.totalProperties || 0,
      icon: HiOutlineLibrary,
      color: "bg-[#ecfdf5] text-[#10b981]"
    },
    {
      title: "Total Inquiries",
      value: stats?.totalInquiries || 0,
      icon: HiOutlineChatAlt2,
      color: "bg-[#faf5ff] text-[#a855f7]"
    },
    {
      title: "Blocked Users",
      value: stats?.blockedUsers || 0,
      icon: HiOutlineBan,
      color: "bg-[#fff5f5] text-[#dc2626]"
    }
  ];

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className={s.headerContainer}>
        <div>
          <h1 className={s.pageTitle}>Dashboard Overview</h1>
          <p className={s.pageSubtitle}>System status, statistics, and administrative controls</p>
        </div>
        <button onClick={fetchStats} className={s.refreshButton} disabled={loading}>
          <HiOutlineRefresh size={18} className={`inline mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-600 rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Stats grid */}
      <div className={s.statsGrid}>
        {statItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <div key={index} className={s.statCard}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={s.statTitle}>{item.title}</p>
                  <h3 className={s.statValue}>{item.value}</h3>
                </div>
                <div className={`${s.statIconContainer} ${item.color}`}>
                  <IconComponent size={24} />
                </div>
              </div>
              
              {/* Additional contextual micro-details */}
              <div className="pt-2 border-t border-[#f1f5f9] text-[0.75rem] text-text-muted flex justify-between">
                {item.title === "Total Users" && (
                  <>
                    <span>Buyers: <strong>{stats?.buyers || 0}</strong></span>
                    <span>Sellers: <strong>{stats?.sellers || 0}</strong></span>
                  </>
                )}
                {item.title === "Active Properties" && (
                  <>
                    <span>For Sale: <strong>{stats?.availableProperties || 0}</strong></span>
                    <span>Sold: <strong>{stats?.soldProperties || 0}</strong></span>
                  </>
                )}
                {item.title === "Total Inquiries" && (
                  <span>Platform connection rate is stable</span>
                )}
                {item.title === "Blocked Users" && (
                  <span>Security status: Safe</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* System health and admin actions */}
      <div className={s.secondGrid}>
        {/* System Health */}
        <div className={s.systemHealthCard}>
          <h3 className={s.systemHealthTitle}>
            <HiOutlineShieldCheck size={20} className="inline mr-2 text-[#10b981]" />
            Services Monitor
          </h3>
          <div className={s.servicesContainer}>
            <div className={s.serviceItem}>
              <span className={s.serviceName}>Database</span>
              <div className={s.statusContainer}>
                <span className={s.statusDot}></span>
                <span className={s.statusText}>Operational</span>
              </div>
            </div>
            <div className={s.serviceItem}>
              <span className={s.serviceName}>Cloudinary Assets storage</span>
              <div className={s.statusContainer}>
                <span className={s.statusDot}></span>
                <span className={s.statusText}>Operational</span>
              </div>
            </div>
            <div className={s.serviceItem}>
              <span className={s.serviceName}>Email Notification Server</span>
              <div className={s.statusContainer}>
                <span className={s.statusDot}></span>
                <span className={s.statusText}>Operational</span>
              </div>
            </div>
            <div className={s.serviceItem}>
              <span className={s.serviceName}>User Session Manager</span>
              <div className={s.statusContainer}>
                <span className={s.statusDot}></span>
                <span className={s.statusText}>Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Admin Actions */}
        <div className={s.adminToolsCard}>
          <h3 className={s.adminToolsTitle}>Admin Utilities</h3>
          <p className={s.adminToolsDesc}>Execute quick administrative checks or navigate to moderation actions.</p>
          <div className={s.adminToolsButtonsContainer}>
            <a href="/admin/seller-requests" className={s.adminToolButton}>
              <HiOutlineUserCircle size={18} className="mr-2" />
              Approve Seller Registrations
            </a>
            <a href="/admin/users" className={s.adminToolButton}>
              <HiOutlineBan size={18} className="mr-2" />
              Audit & Block Violating Users
            </a>
            <a href="/admin/properties" className={s.adminToolButton}>
              <HiOutlineTrash size={18} className="mr-2" />
              Moderate Properties & Listings
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;