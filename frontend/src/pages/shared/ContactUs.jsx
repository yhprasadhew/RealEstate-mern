import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineShieldCheck,
} from "react-icons/hi";
import Navbar from "../../components/common/Navbar";
import { useAuth, api } from "../../context/AuthContext";
import { contactStyles as s } from "../../assets/dummyStyles";

const ContactUs = () => {
  const { user } = useAuth();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "buyer",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Auto-fill fields for logged-in users
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role && ["buyer", "seller", "admin"].includes(user.role) ? user.role : "buyer",
        message: "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Simple validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill out all required fields.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/contact", formData);
      if (res.data.success) {
        setSuccess(true);
        // Clear message field but keep info filled
        setFormData((prev) => ({
          ...prev,
          message: "",
        }));
      } else {
        setError(res.data.message || "Failed to submit. Please try again.");
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <Navbar />

      <main className={s.mainContainer}>
        {/* Header */}
        <div className={s.header}>
          <h1 className={s.heading}>Get In Touch</h1>
          <p className={s.subheading}>
            Have questions about a property or our services? Drop us a line and our team will get back to you shortly.
          </p>
        </div>

        {/* Grid layout */}
        <div className={s.grid}>
          {/* LEFT COLUMN: Contact Details & Admin Quick Link */}
          <div className={s.contactInfoContainer}>
            {/* Info Card */}
            <div className={s.contactInfoCard}>
              <h2 className="text-xl font-extrabold mb-6 text-slate-900">Contact Details</h2>

              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlinePhone size={20} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Call Us</h4>
                  <a href="tel:+94112345678" className={`${s.contactDetail} hover:text-primary transition-colors`}>
                    +94 11 234 5678
                  </a>
                </div>
              </div>

              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineMail size={20} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Email Us</h4>
                  <a href="mailto:support@realestate.com" className={`${s.contactDetail} hover:text-primary transition-colors`}>
                    support@realestate.com
                  </a>
                </div>
              </div>

              <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineLocationMarker size={20} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Head Office</h4>
                  <p className={s.contactDetail}>100 Luxury Plaza, Colombo, Sri Lanka</p>
                </div>
              </div>

              <div className={s.contactItem}>
                <div className={s.contactIconWrapper}>
                  <HiOutlineClock size={20} />
                </div>
                <div>
                  <h4 className={s.contactTitle}>Office Hours</h4>
                  <p className={s.contactDetail}>Mon - Fri: 9:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>

            {/* Quick Support Card / Simulated map */}
            <div className="card-premium p-8 bg-gradient-to-br from-teal-600 to-emerald-800 text-white flex flex-col justify-center gap-2">
              <h3 className="font-extrabold text-lg">Elite Service Guaranteed</h3>
              <p className="text-sm opacity-90 leading-relaxed">
                Whether buying, renting, or selling, our property experts are always ready to guide you step-by-step.
              </p>
            </div>

            {/* Admin Path Button (Only visible if administrator is logged in) */}
            {user?.role === "admin" && (
              <div className="card-premium p-6 border-amber-200 bg-amber-50/50 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-amber-800">
                  <HiOutlineShieldCheck size={24} className="shrink-0" />
                  <h4 className="font-extrabold text-sm uppercase tracking-wide">Admin Portal Access</h4>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  As an administrator, you can view the contact list dashboard to answer user inquiries directly.
                </p>
                <Link
                  to="/admin/contacts"
                  className="w-full text-center py-2.5 px-4 rounded-xl bg-amber-600 text-white text-sm font-bold shadow-sm hover:bg-amber-700 transition-colors"
                >
                  View Submitted Contacts
                </Link>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Contact Form */}
          <div className={s.formCard}>
            {success ? (
              <div className={s.successContainer}>
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                  <HiOutlineCheckCircle size={36} />
                </div>
                <h2 className={`${s.successTitle} text-slate-900`}>Message Sent Successfully!</h2>
                <p className={s.successMessage}>
                  Thank you for contacting us. Our administration team has been notified and we will reach out to you via your email address shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn btn-primary py-3 px-8 rounded-xl font-bold cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={s.form}>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Send us a Message</h2>

                {error && <div className={s.errorMessage}>{error}</div>}

                <div className={s.formTwoColGrid}>
                  <div className={s.inputGroup}>
                    <label className={s.label}>Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      className={s.input}
                      required
                    />
                  </div>

                  <div className={s.inputGroup}>
                    <label className={s.label}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={s.input}
                      required
                    />
                  </div>
                </div>

                <div className={s.formTwoColGrid}>
                  <div className={s.inputGroup}>
                    <label className={s.label}>Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+94 77 123 4567"
                      className={s.input}
                    />
                  </div>

                  <div className={s.inputGroup}>
                    <label className={s.label}>Your Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className={`${s.input} bg-white cursor-pointer`}
                    >
                      <option value="buyer">Buyer</option>
                      <option value="seller">Seller</option>
                      <option value="visitor">Visitor</option>
                    </select>
                  </div>
                </div>

                <div className={s.inputGroup}>
                  <label className={s.label}>Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your inquiry in detail..."
                    className={`${s.input} ${s.textarea}`}
                    rows="5"
                    required
                  ></textarea>
                </div>

                <button type="submit" disabled={loading} className={s.submitButton}>
                  {loading ? "Submitting..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactUs;
