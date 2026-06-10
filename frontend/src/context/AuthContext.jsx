import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_URL from "../config";

// Create a dedicated Axios instance to prevent global interceptor pollution
export const api = axios.create({
  baseURL: API_URL,
});

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // =====================================
  // Lazy State Initializer
  // =====================================
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token") || sessionStorage.getItem("token") || null;
  });

  const [loading, setLoading] = useState(true);

  // =====================================
  // Helper: Sync Credentials to Storage & Instance
  // =====================================
  const syncAuthCredentials = useCallback((resToken, resUser, rememberMe = true) => {
    setToken(resToken);
    setUser(resUser);

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("token", resToken);
    storage.setItem("user", JSON.stringify(resUser));

    api.defaults.headers.common["Authorization"] = `Bearer ${resToken}`;
  }, []);

  // =====================================
  // Action: Logout
  // =====================================
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  }, [navigate]);

  // =====================================
  // Sync Initialization Instance Headers
  // =====================================
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
    setLoading(false);
  }, [token]);

  // =====================================
  // Interceptor: Auto Logout on 403 Blocked
  // =====================================
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response?.status === 403 &&
          error.response.data?.message?.toLowerCase().includes("blocked")
        ) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [logout]);

  // =====================================
  // Action: Login
  // =====================================
  const login = useCallback(async (email, password, rememberMe = true) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      const { token: resToken, user: resUser } = res.data;

      syncAuthCredentials(resToken, resUser, rememberMe);

      return { success: true, user: resUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  }, [syncAuthCredentials]);

  // =====================================
  // Action: Register
  // =====================================
  const register = useCallback(async (userData) => {
    try {
      const res = await api.post("/api/auth/register", userData);

      return {
        success: res.data.success,
        message: res.data.message,
        user: res.data.user,
        emailSent: res.data.emailSent,
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  }, []);

  // =====================================
  // Action: Refresh User Profile
  // =====================================
  const refreshUser = useCallback(async () => {
    // Read directly from storage or current scope to prevent state desync stale closures
    const currentToken = token || localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!currentToken) return { success: false, message: "No token available" };

    try {
      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      const updatedUser = res.data.user;

      setUser(updatedUser);
      
      const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
      storage.setItem("user", JSON.stringify(updatedUser));

      return { success: true, user: updatedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to refresh user",
      };
    }
  }, [token]);

  // =====================================
  // Value Payload Memoization
  // =====================================
  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    refreshUser,
    setUser,
    setToken,
    isAuthenticated: !!token,
  }), [user, token, loading, login, register, logout, refreshUser]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};