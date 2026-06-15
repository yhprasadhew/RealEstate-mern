import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { HiEye, HiEyeOff } from "react-icons/hi";

import { loginStyles as s } from "../../assets/dummyStyles";
import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Handle login submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        const storedUser = JSON.parse(
          localStorage.getItem("user") || sessionStorage.getItem("user")
        );

        if (storedUser?.role === "admin") {
          navigate("/admin-dashboard");
        } else if (storedUser?.role === "seller") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError(result.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Explicitly force layout to stack normally
    <div className="min-h-screen flex flex-col bg-gray-50"> 

      {/* This container will now perfectly occupy the rest of the height and center the card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className={s.card}>
          <h2 className={s.title}>Welcome Back</h2>

          <p className={s.subtitle}>
            Please enter your details to login
          </p>

          {error && (
            <div className={s.errorAlert}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className={s.form}>
            {/* Email */}
            <div>
              <label className={s.label}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className={s.input}
              />
            </div>

            {/* Password */}
            <div>
              <label className={s.label}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter password"
                  required
                  className={`${s.input} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                </button>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className={s.forgotLink}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={s.submitButton}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Register Link */}
            <p className={s.footerText}>
              Don't have an account?{" "}
              <Link to="/register" className={s.link}>
                Register
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;