import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

import { verifyEmailStyles as s } from "../../assets/dummyStyles";
import Navbar from "../../components/common/Navbar";
import API_URL from "../../config";

const VerifyEmail = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const emailFromState = location.state?.email || "";
  const [email, setEmail] = useState(emailFromState);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-email`, {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });

      if (res.data.success) {
        setSuccess(res.data.message || "Email verified successfully!");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/resend-verification`, {
        email: email.trim().toLowerCase(),
      });

      if (res.data.success) {
        setSuccess(res.data.message || "A new verification code has been sent.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className={s.pageContainer}>
      <Navbar />

      <div className={s.containerCenter}>
        <div className={s.card}>
          <h2 className={s.title}>Verify Your Email</h2>

          <p className={s.subtitle}>
            Enter the 6-digit code sent to your email to finish creating your
            account.
          </p>

          {error && <div className={s.errorAlert}>{error}</div>}

          {success && <div className={s.successAlert}>{success}</div>}

          <form onSubmit={handleSubmit} className={s.form}>
            <div>
              <label className={s.label}>Email Address</label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className={s.input}
              />
            </div>

            <div>
              <label className={s.label}>Verification Code</label>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                required
                className={s.codeInput}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className={s.submitButton}
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending || !email.trim()}
            className="mt-4 w-full text-sm font-medium text-primary hover:underline disabled:opacity-50"
          >
            {isResending ? "Sending..." : "Resend verification code"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
