import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

import Navbar from "../../components/common/Navbar";
import { forgotPasswordStyles as s } from "../../assets/dummyStyles";
import API_URL from "../../config";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Submit email to receive reset link
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/forgot-password`,
        {
          email,
        }
      );

      if (res.data.success) {
        setSuccess(
          "Password reset link has been sent to your email."
        );
        setEmail("");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not send reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={s.container}>
      <Navbar />

      <div className={s.centerWrapper}>
        <div className={s.formCard}>
          <h2 className={s.title}>
            Forgot Password
          </h2>

          <p className={s.subtitle}>
            Enter your email address and we'll send you
            a password reset link.
          </p>

          {error && (
            <div className={s.errorMessage}>
              {error}
            </div>
          )}

          {success && (
            <div className={s.successMessage}>
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className={s.form}
          >
            <div>
              <label className={s.label}>
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="name@example.com"
                required
                className={s.input}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={s.submitButton}
            >
              {isLoading
                ? "Sending..."
                : "Send Reset Link"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className={s.backLink}
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;