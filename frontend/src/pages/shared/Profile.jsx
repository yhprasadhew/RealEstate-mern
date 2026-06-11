import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiX,
} from "react-icons/hi";

import { profileStyles as s } from "../../assets/dummyStyles";
import { api, useAuth } from "../../context/AuthContext";
import Navbar from "../../components/common/Navbar";

const NOT_PROVIDED = "Not Provided";

const Profile = () => {
  const { user, setUser, token, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeProfilePic, setRemoveProfilePic] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const syncUserToStorage = (updatedUser) => {
    const storage = localStorage.getItem("token")
      ? localStorage
      : sessionStorage;
    storage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const resetEditState = (userData) => {
    setFormData({
      name: userData?.name || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
    });
    setImageFile(null);
    setImagePreview(null);
    setRemoveProfilePic(false);
    setError(null);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/api/user/profile");
        if (res.data.success) {
          setProfile(res.data.user);
          resetEditState(res.data.user);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }

  const displayUser = profile || user;
  const profileImage = displayUser?.profilePicture;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData({ ...formData, [name]: numericValue });
      return;
    }

    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setRemoveProfilePic(false);
    }
  };

  const handleEdit = () => {
    resetEditState(displayUser);
    setIsEditing(true);
  };

  const handleCancel = () => {
    resetEditState(displayUser);
    setIsEditing(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("phone", formData.phone);
      data.append("address", formData.address);

      if (imageFile) {
        data.append("profilePic", imageFile);
      }
      if (removeProfilePic) {
        data.append("removeProfilePic", "true");
      }

      const res = await api.put("/api/user/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const updatedUser = res.data.user;
        setProfile(updatedUser);
        syncUserToStorage(updatedUser);
        setIsEditing(false);
        setImageFile(null);
        setImagePreview(null);
        setRemoveProfilePic(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const showAvatarImage =
    imagePreview || (!removeProfilePic && profileImage);

  return (
    <div className={s.containerWrapper?.(displayUser?.role)}>
      {displayUser?.role !== "seller" && <Navbar />}

      <div className={s.mainContainer?.(displayUser?.role)}>
        <header className={s.header}>
          <h1 className={s.pageTitle}>Personal Profile</h1>
          <p className={s.pageSubtitle}>
            Manage your personal information and account settings
          </p>
        </header>

        <div className={s.card}>
          {error && <div className={s.errorMessage}>{error}</div>}

          <form onSubmit={handleUpdate}>
            <div className={s.profileHeader}>
              <div className={s.avatarSection}>
                <div className={s.avatarWrapper}>
                  {showAvatarImage ? (
                    <img
                      src={imagePreview || profileImage}
                      alt="Profile"
                      className={s.avatarImage}
                    />
                  ) : (
                    <span className={s.avatarPlaceholder}>
                      {displayUser?.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <label className={s.uploadButton} title="Upload photo">
                      <input
                        type="file"
                        onChange={handleImageChange}
                        className="hidden"
                        accept="image/*"
                      />
                      <HiOutlineUser size={20} />
                    </label>

                    {showAvatarImage && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                          setRemoveProfilePic(true);
                        }}
                        className={s.removeButton}
                        title="Remove profile picture"
                      >
                        <HiX size={20} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div>
                <h2 className={s.userName}>{displayUser?.name}</h2>
                <span className={s.roleBadge}>
                  {displayUser?.role?.toUpperCase()}
                </span>
              </div>
            </div>

            {isEditing ? (
              <div className={s.editForm}>
                <div>
                  <label className={s.label}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Email Address</label>
                  <input
                    type="email"
                    value={displayUser?.email || ""}
                    disabled
                    className={`${s.input} opacity-60 cursor-not-allowed`}
                  />
                </div>

                <div>
                  <label className={s.label}>Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter 10-digit phone number"
                    className={s.input}
                  />
                </div>

                <div>
                  <label className={s.label}>Location / Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className={s.textarea}
                  />
                </div>

                <div className={s.formActions}>
                  <button
                    type="submit"
                    disabled={saving}
                    className={s.saveButton}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={saving}
                    className={s.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={s.infoSection}>
                <div className={s.infoItem}>
                  <div className={s.infoIcon}>
                    <HiOutlineMail size={22} />
                  </div>
                  <div>
                    <p className={s.infoLabel}>Email Address</p>
                    <p className={s.infoValue}>
                      {displayUser?.email || NOT_PROVIDED}
                    </p>
                  </div>
                </div>

                <div className={s.infoItem}>
                  <div className={s.infoIcon}>
                    <HiOutlinePhone size={22} />
                  </div>
                  <div>
                    <p className={s.infoLabel}>Phone Number</p>
                    <p className={s.infoValue}>
                      {displayUser?.phone || NOT_PROVIDED}
                    </p>
                  </div>
                </div>

                <div className={s.infoItem}>
                  <div className={s.infoIcon}>
                    <HiOutlineLocationMarker size={22} />
                  </div>
                  <div>
                    <p className={s.infoLabel}>Location / Address</p>
                    <p className={s.infoValue}>
                      {displayUser?.address || NOT_PROVIDED}
                    </p>
                  </div>
                </div>

                <div className={s.editButtonWrapper}>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className={s.editProfileButton}
                  >
                    Edit Profile Details
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
