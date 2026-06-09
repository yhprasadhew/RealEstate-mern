import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  const isGuestAllowed = allowedRoles?.includes(undefined);

  // User not logged in
  if (!user && !isGuestAllowed) {
    return <Navigate to="/login" replace />;
  }

  // User logged in but role not allowed
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "seller") {
      return <Navigate to="/dashboard" replace />;
    }

    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const PublicRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center p-25">
        <div className="loader"></div>
      </div>
    );
  }

  // Redirect authenticated users away from login/register pages
  if (user) {
    if (user.role === "admin") {
      return <Navigate to="/admin-dashboard" replace />;
    }

    if (user.role === "seller") {
      return <Navigate to="/dashboard" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export { ProtectedRoute, PublicRoute };