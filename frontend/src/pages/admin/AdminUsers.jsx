import React, { useEffect, useState, useCallback } from "react";
import { 
  HiOutlineBan, 
  HiOutlineTrash, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineFilter,
  HiCheckCircle,
  HiXCircle,
  HiOutlineCheckCircle
} from "react-icons/hi";
import { api } from "../../context/AuthContext";
import { adminUsersStyles as s } from "../../assets/dummyStyles";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/users");
      if (res.data.success) {
        setUsers(res.data.users);
      } else {
        setError("Failed to retrieve users list");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleBlock = async (userId, isCurrentlyBlocked) => {
    const action = isCurrentlyBlocked ? "unblock" : "block";
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      const res = await api.patch(`/api/admin/users/${userId}/${action}`);
      if (res.data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: !isCurrentlyBlocked } : user
          )
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} user`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to DELETE this user? This will also remove all their properties and inquiries. This action is irreversible.")) return;

    try {
      const res = await api.delete(`/api/admin/users/${userId}`);
      if (res.data.success) {
        setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (selectedRole === "all") return true;
    return user.role === selectedRole;
  });

  if (loading && users.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="loader"></div>
      </div>
    );
  }

  return (
    <div className="fade-in p-6 max-w-7xl mx-auto">
      {/* Header Container */}
      <div className={s.containerHeader}>
        <div>
          <h1 className={s.headerTitle}>User Accounts</h1>
          <p className={s.headerSubtitle}>Manage system buyers, sellers, and administrators</p>
        </div>

        {/* Filter Dropdown */}
        <div className={s.filterWrapper}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            className={s.filterButton}
          >
            <HiOutlineFilter size={18} />
            <span>Role: {selectedRole.toUpperCase()}</span>
          </button>
          
          {dropdownOpen && (
            <div className={s.filterDropdown}>
              {["all", "buyer", "seller", "admin"].map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setDropdownOpen(false);
                  }}
                  className={s.filterOption(selectedRole === role)}
                >
                  {role.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex justify-between">
          <span>{error}</span>
          <button onClick={fetchUsers} className="font-bold underline cursor-pointer">Retry</button>
        </div>
      )}

      {/* Main Table Card */}
      <div className={s.cardContainer}>
        <div className={s.cardHeader}>
          <div className={s.cardTitleRow}>
            <h2 className={s.cardTitle}>Registered Users</h2>
            <div className={s.userCount}>
              Total Accounts: <span className={s.userCountSpan}>{filteredUsers.length}</span>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className={s.emptyState}>
            No accounts found matching this filter criteria.
          </div>
        ) : (
          <div className={s.tableWrapper}>
            <table className={s.table}>
              <thead className={s.thead}>
                <tr className={s.tableRow}>
                  <th className={s.thUserInfo}>User Details</th>
                  <th className={s.thRole}>Access Role</th>
                  <th className={s.thContact}>Contact Information</th>
                  <th className={s.thStatus}>Account Status</th>
                  <th className={s.thActions}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={s.tableRow}>
                    {/* User Details */}
                    <td className={s.tdUserInfo}>
                      <div className="flex items-center gap-3">
                        <div className={s.userAvatar}>
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className={s.userInfoName}>{user.name}</div>
                          <div className={s.userInfoId}>ID: {user._id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className={s.tdRole}>
                      <span className={s.roleBadge(user.role)}>
                        {user.role}
                      </span>
                    </td>

                    {/* Contact info */}
                    <td className={s.tdContact}>
                      <div className={s.contactWrapper}>
                        <div className={s.contactEmail}>
                          <HiOutlineMail size={16} className="text-text-muted" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className={s.contactPhone}>
                            <HiOutlinePhone size={16} className="text-text-muted" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className={s.tdStatus}>
                      {user.isBlocked ? (
                        <span className={s.statusBadgeBlocked}>
                          <HiXCircle size={16} />
                          Blocked
                        </span>
                      ) : (
                        <span className={s.statusBadgeActive}>
                          <HiCheckCircle size={16} />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className={s.tdActions}>
                      <div className={s.actionsWrapper}>
                        <button
                          onClick={() => handleToggleBlock(user._id, user.isBlocked)}
                          className={s.blockButton(user.isBlocked)}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? (
                            <HiOutlineCheckCircle size={18} />
                          ) : (
                            <HiOutlineBan size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className={s.deleteButton}
                          title="Wipe User Data"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
